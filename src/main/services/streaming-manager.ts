import { randomUUID } from 'crypto'
import { join } from 'path'
import { app } from 'electron'
import type WebTorrent from 'webtorrent'
import { getClient } from './torrent-client'
import { ANNOUNCE_TRACKERS } from '../config/trackers'
import { reannounce } from './torrent-reannounce'

// ---------- Types ----------

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v', '.wmv'])

interface StreamingSession {
  id: string
  torrent: WebTorrent.Torrent
  file: WebTorrent.File
  magnetLink: string
  /** True when this session added the torrent (not reusing a download torrent). */
  ownsTorrent: boolean
}

// ---------- State ----------

const sessions = new Map<string, StreamingSession>()

// ---------- Helpers ----------

function findVideoFile(torrent: WebTorrent.Torrent): WebTorrent.File | null {
  let largest: WebTorrent.File | null = null
  for (const file of torrent.files) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (VIDEO_EXTENSIONS.has(ext)) {
      if (!largest || file.length > largest.length) {
        largest = file
      }
    }
  }
  return largest
}

// ---------- Public API ----------

/**
 * Start a streaming session from a magnet link.
 * Waits for torrent metadata, finds the largest video file, and returns a
 * session ID the renderer can pass to the video server's /stream route.
 */
export async function startStreaming(
  magnetLink: string
): Promise<{ id: string; fileName: string }> {
  const client = await getClient()
  const id = randomUUID()

  // Always use client.add() — WebTorrent deduplicates internally by infoHash.
  // client.get() can return an object without EventEmitter methods, so we avoid it.
  const streamPath = join(app.getPath('temp'), 'cerberus-streams')
  const torrent = client.add(magnetLink, {
    path: streamPath,
    announce: ANNOUNCE_TRACKERS,
    // Sequential strategy: download pieces in order so the video player
    // gets playable data from the start of the file as fast as possible.
    strategy: 'sequential'
  })

  // Wait for metadata (file list & sizes) if not already available
  const hasMetadata = torrent.files && torrent.files.length > 0
  if (!hasMetadata) {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timed out waiting for torrent metadata'))
      }, 60_000)
      torrent.on('ready', () => {
        clearTimeout(timeout)
        resolve()
      })
      torrent.on('error', (err: unknown) => {
        clearTimeout(timeout)
        reject(err)
      })
    })
  }

  // Find the largest video file
  const videoFile = findVideoFile(torrent)
  if (!videoFile) {
    if (!torrent.destroyed) torrent.destroy()
    throw new Error('No video file found in torrent')
  }

  // Deselect non-video files to save bandwidth
  for (const f of torrent.files) {
    if (f !== videoFile) f.deselect?.()
  }
  // Explicitly select + prioritize the video file
  videoFile.select?.()

  // ── Streaming startup optimizations ──
  // Prioritize the first few pieces and the last few pieces.
  // MP4 files often have the moov atom at the end — the player needs it
  // before it can determine duration/codecs and start decoding.
  if (torrent.pieces && torrent.pieces.length > 0) {
    const totalPieces = torrent.pieces.length
    const headPieces = Math.min(40, totalPieces)
    const tailPieces = Math.min(10, totalPieces)
    torrent.critical?.(0, headPieces - 1)
    if (totalPieces > tailPieces) {
      torrent.critical?.(totalPieces - tailPieces, totalPieces - 1)
    }
  }

  // Aggressively announce to trackers to find peers faster
  reannounce(torrent)

  sessions.set(id, { id, torrent, file: videoFile, magnetLink, ownsTorrent: true })
  console.log(
    `[streaming] Session ${id} started — file: ${videoFile.name} (${(videoFile.length / 1024 / 1024).toFixed(1)} MB)`
  )
  return { id, fileName: videoFile.name }
}

/** Stop a streaming session and clean up resources. */
export function stopStreaming(id: string): boolean {
  const session = sessions.get(id)
  if (!session) return false

  if (session.ownsTorrent && !session.torrent.destroyed) {
    try {
      session.torrent.destroy({ destroyStore: true })
    } catch {
      // ignore
    }
  }

  sessions.delete(id)
  console.log(`[streaming] Session ${id} stopped`)
  return true
}

/** Get a session (used by the video server to stream data). */
export function getStreamingSession(id: string): StreamingSession | undefined {
  return sessions.get(id)
}

/** Return the absolute file path of the video being streamed. */
export function getStreamingFilePath(id: string): string | null {
  const session = sessions.get(id)
  if (!session) return null
  return join(session.torrent.path, session.file.path)
}

/**
 * Compute an array of downloaded [startPct, endPct] ranges from the torrent's
 * pieces array. Completed pieces are `null` at runtime.
 */
function computeDownloadedRanges(torrent: WebTorrent.Torrent): [number, number][] {
  const pieces = torrent.pieces
  if (!pieces || pieces.length === 0) return []

  const total = pieces.length
  const ranges: [number, number][] = []
  let rangeStart: number | null = null

  for (let i = 0; i < total; i++) {
    // In WebTorrent, completed pieces are set to null
    const isDownloaded = (pieces as unknown[])[i] === null
    if (isDownloaded) {
      if (rangeStart === null) rangeStart = i
    } else {
      if (rangeStart !== null) {
        ranges.push([(rangeStart / total) * 100, (i / total) * 100])
        rangeStart = null
      }
    }
  }

  if (rangeStart !== null) {
    ranges.push([(rangeStart / total) * 100, 100])
  }

  // Cap at 80 ranges to keep IPC payload small
  if (ranges.length > 80) {
    // Merge smallest gaps
    return mergeSmallGaps(ranges, 80)
  }
  return ranges
}

/** Merge the smallest gaps between consecutive ranges until we have at most `maxRanges`. */
function mergeSmallGaps(ranges: [number, number][], maxRanges: number): [number, number][] {
  const result = [...ranges]
  while (result.length > maxRanges) {
    // Find smallest gap
    let minGap = Infinity
    let minIdx = 0
    for (let i = 0; i < result.length - 1; i++) {
      const gap = result[i + 1][0] - result[i][1]
      if (gap < minGap) {
        minGap = gap
        minIdx = i
      }
    }
    // Merge ranges at minIdx and minIdx+1
    result[minIdx] = [result[minIdx][0], result[minIdx + 1][1]]
    result.splice(minIdx + 1, 1)
  }
  return result
}

/** Return live stats for a streaming session. */
export function getStreamingStats(id: string) {
  const session = sessions.get(id)
  if (!session) return null

  const { torrent, file } = session
  return {
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    numPeers: torrent.numPeers,
    progress: torrent.progress,
    downloaded: torrent.downloaded,
    fileLength: file.length,
    numPieces: torrent.pieces?.length ?? 0,
    /** Downloaded byte ranges as [startPct, endPct] (0–100) */
    downloadedRanges: computeDownloadedRanges(torrent)
  }
}

/**
 * Re-prioritize pieces around a seek position so the player gets data
 * from the new playback offset as fast as possible.
 */
export function seekStream(id: string, byteOffset: number): boolean {
  const session = sessions.get(id)
  if (!session) return false

  const { torrent } = session
  if (!torrent.pieces || torrent.pieces.length === 0) return false

  // Calculate the piece index that contains `byteOffset`
  const pieceLength = torrent.pieces[0]?.length
  if (!pieceLength) return false

  const targetPiece = Math.floor(byteOffset / pieceLength)
  const totalPieces = torrent.pieces.length

  // Mark a window of pieces around the target as critical
  const headWindow = Math.min(40, totalPieces)
  const start = Math.max(0, targetPiece)
  const end = Math.min(totalPieces - 1, targetPiece + headWindow - 1)
  torrent.critical?.(start, end)

  console.log(`[streaming] Seek re-prioritized: pieces ${start}–${end} (byte offset ${byteOffset})`)
  return true
}

/** Tear down all active streaming sessions (called on app quit). */
export function shutdownAllStreams(): void {
  for (const [, session] of sessions) {
    if (session.ownsTorrent && !session.torrent.destroyed) {
      try {
        session.torrent.destroy({ destroyStore: true })
      } catch {
        // ignore
      }
    }
  }
  sessions.clear()
}
