import { randomUUID } from 'crypto'
import { join, extname } from 'path'
import { app } from 'electron'
import type WebTorrent from 'webtorrent'
import { getPool } from './pool'
import { sanitizeMagnet, curatedTrackers } from './policies/magnet'
import { findVideoFile, selectOnly } from './policies/file'
import { applyStreamingPriority, applySeekPriority } from './policies/piece'
import { TorrentError } from './errors'

/**
 * Stream sessions live in a separate WebTorrent pool from downloads. This
 * isolation is the fix for the data-loss bug where stopping a stream
 * destroyed the on-disk files of a download that happened to share an
 * info-hash.
 */

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v', '.wmv'])
const METADATA_TIMEOUT_MS = 60_000
const EXTERNAL_IDLE_MS = 10 * 60 * 1000

interface StreamingSession {
  id: string
  torrent: WebTorrent.Torrent
  file: WebTorrent.File
  external: boolean
  idleTimer: NodeJS.Timeout | null
  rangesCache: { downloaded: number; ranges: [number, number][] } | null
}

const sessions = new Map<string, StreamingSession>()

export async function startStreaming(magnet: string): Promise<{ id: string; fileName: string }> {
  const sanitized = sanitizeMagnet(magnet)
  const client = await getPool('stream')
  const id = randomUUID()
  const streamPath = join(app.getPath('temp'), 'cerberus-streams', id)

  const torrent = client.add(sanitized.magnet, {
    path: streamPath,
    announce: [...curatedTrackers()],
    strategy: 'sequential'
  } as Record<string, unknown>)

  // Wait for metadata before selecting a file.
  if (!torrent.files || torrent.files.length === 0) {
    try {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          cleanup()
          reject(new TorrentError('metadata-timeout', 'Stream metadata timed out'))
        }, METADATA_TIMEOUT_MS)

        const onError = (err: unknown): void => {
          cleanup()
          reject(err)
        }
        const onReady = (): void => {
          cleanup()
          resolve()
        }
        const cleanup = (): void => {
          clearTimeout(timer)
          torrent.off?.('ready', onReady)
          torrent.off?.('error', onError)
        }
        torrent.once('ready', onReady)
        torrent.once('error', onError)
      })
    } catch (err) {
      if (!torrent.destroyed) torrent.destroy()
      throw err
    }
  }

  const videoFile = findVideoFile(torrent)
  if (!videoFile || !VIDEO_EXTENSIONS.has(extname(videoFile.name).toLowerCase())) {
    if (!torrent.destroyed) torrent.destroy()
    throw new TorrentError('invalid-magnet', 'No video file found in torrent')
  }

  selectOnly(torrent, videoFile)
  applyStreamingPriority(torrent, extname(videoFile.name))

  sessions.set(id, {
    id,
    torrent,
    file: videoFile,
    external: false,
    idleTimer: null,
    rangesCache: null
  })

  console.log(
    `[stream/${id}] started — ${videoFile.name} (${(videoFile.length / 1024 / 1024).toFixed(1)} MB)`
  )
  return { id, fileName: videoFile.name }
}

/**
 * External sessions ignore stop calls unless `force` is set: the in-app
 * player unmount path otherwise tears down a stream the user is still
 * watching elsewhere.
 */
export function stopStreaming(id: string, force = false): boolean {
  const session = sessions.get(id)
  if (!session) return false
  if (session.external && !force) return false

  if (session.idleTimer) {
    clearTimeout(session.idleTimer)
    session.idleTimer = null
  }

  if (!session.torrent.destroyed) {
    try {
      // Stream pool is isolated, so destroyStore is always safe here.
      const destroyStore = !session.external
      session.torrent.destroy({ destroyStore })
    } catch {
      // ignore
    }
  }
  sessions.delete(id)
  console.log(`[stream/${id}] stopped`)
  return true
}

export function markSessionExternal(id: string): boolean {
  const session = sessions.get(id)
  if (!session) return false
  session.external = true
  touchSession(id)
  return true
}

export function touchSession(id: string): void {
  const session = sessions.get(id)
  if (!session || !session.external) return
  if (session.idleTimer) clearTimeout(session.idleTimer)
  session.idleTimer = setTimeout(() => {
    console.log(`[stream/${id}] external session idle — auto-stopping`)
    stopStreaming(id, true)
  }, EXTERNAL_IDLE_MS)
}

export function getStreamingSession(
  id: string
): { torrent: WebTorrent.Torrent; file: WebTorrent.File; external: boolean } | undefined {
  const s = sessions.get(id)
  return s ? { torrent: s.torrent, file: s.file, external: s.external } : undefined
}

export function getStreamingFilePath(id: string): string | null {
  const session = sessions.get(id)
  if (!session) return null
  return join(session.torrent.path, session.file.path)
}

export function seekStream(id: string, byteOffset: number): boolean {
  const session = sessions.get(id)
  if (!session) return false
  const range = applySeekPriority(session.torrent, byteOffset)
  if (!range) return false
  console.log(
    `[stream/${id}] seek → pieces ${range.start}–${range.end} (byte offset ${byteOffset})`
  )
  return true
}

export function getStreamingStats(id: string): {
  downloadSpeed: number
  uploadSpeed: number
  numPeers: number
  progress: number
  downloaded: number
  fileLength: number
  numPieces: number
  downloadedRanges: [number, number][]
} | null {
  const session = sessions.get(id)
  if (!session) return null

  const { torrent, file } = session
  const downloaded = torrent.downloaded
  let ranges: [number, number][]
  if (session.rangesCache && session.rangesCache.downloaded === downloaded) {
    ranges = session.rangesCache.ranges
  } else {
    ranges = computeDownloadedRanges(torrent)
    session.rangesCache = { downloaded, ranges }
  }

  return {
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    numPeers: torrent.numPeers,
    progress: torrent.progress,
    downloaded,
    fileLength: file.length,
    numPieces: torrent.pieces?.length ?? 0,
    downloadedRanges: ranges
  }
}

export function shutdownAllStreams(): void {
  for (const [, session] of sessions) {
    if (session.idleTimer) {
      clearTimeout(session.idleTimer)
      session.idleTimer = null
    }
    if (!session.torrent.destroyed) {
      try {
        session.torrent.destroy({ destroyStore: true })
      } catch {
        // ignore
      }
    }
  }
  sessions.clear()
}

// ────────── ranges (kept from old impl; pieces[i]===null is the webtorrent contract) ──────────

function computeDownloadedRanges(torrent: WebTorrent.Torrent): [number, number][] {
  const pieces = torrent.pieces
  if (!pieces || pieces.length === 0) return []

  const total = pieces.length
  const ranges: [number, number][] = []
  let rangeStart: number | null = null

  for (let i = 0; i < total; i++) {
    const isDownloaded = (pieces as unknown[])[i] === null
    if (isDownloaded) {
      if (rangeStart === null) rangeStart = i
    } else if (rangeStart !== null) {
      ranges.push([(rangeStart / total) * 100, (i / total) * 100])
      rangeStart = null
    }
  }
  if (rangeStart !== null) ranges.push([(rangeStart / total) * 100, 100])

  return ranges.length > 80 ? mergeSmallGaps(ranges, 80) : ranges
}

function mergeSmallGaps(ranges: [number, number][], maxRanges: number): [number, number][] {
  const result = [...ranges]
  while (result.length > maxRanges) {
    let minGap = Infinity
    let minIdx = 0
    for (let i = 0; i < result.length - 1; i++) {
      const gap = result[i + 1][0] - result[i][1]
      if (gap < minGap) {
        minGap = gap
        minIdx = i
      }
    }
    result[minIdx] = [result[minIdx][0], result[minIdx + 1][1]]
    result.splice(minIdx + 1, 1)
  }
  return result
}
