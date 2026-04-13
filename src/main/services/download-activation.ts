import type WebTorrent from 'webtorrent'
import type { ManagedDownload } from './download-items'
import {
  setActiveDownload,
  removeActiveDownload,
  activeDownloadMapSize,
  getActiveDownloadsMap
} from './download-state'
import { upsertRecord, getRecord } from './download-store'
import { getClient } from './torrent-client'
import { ANNOUNCE_TRACKERS } from '../config/trackers'
import { safeNum } from './download-helpers'
import { reannounce, startReannounceLoop } from './torrent-reannounce'
import { addCompletedMovieToLibrary } from './library'
import {
  startProgressBroadcast,
  stopProgressBroadcast,
  emitProgressUpdate
} from './progress-broadcaster'
import { getAllDownloadItems } from './download-items'
import { processQueue } from './download-queue'

/**
 * Wire-count thresholds at which we trigger an extra re-announce.
 * The first few peer connections are the most impactful — each new peer
 * can provide PEX data that bootstraps the swarm exponentially.
 */
const WIRE_REANNOUNCE_THRESHOLDS = [1, 3, 5]

// ---------- Activation ----------

/** Start a torrent for a persisted download record. */
export async function activateDownload(id: string): Promise<boolean> {
  const record = getRecord(id)
  if (!record) return false

  const wt = await getClient()

  const managed: ManagedDownload = {
    id: record.id,
    torrent: null,
    name: record.name,
    magnetLink: record.magnetLink,
    savePath: record.savePath,
    imdbId: record.imdbId,
    isCustom: record.isCustom,
    priority: record.priority,
    lastProgress: record.progress,
    lastDownloaded: record.downloaded,
    lastTotalSize: record.totalSize
  }
  setActiveDownload(id, managed)

  const torrent = wt.add(record.magnetLink, {
    path: record.savePath,
    announce: ANNOUNCE_TRACKERS,
    strategy: 'rarest'
  } as Record<string, unknown>)
  managed.torrent = torrent

  startReannounceLoop(id, torrent)
  setupWireReannounce(id, torrent)

  torrent.on('error', (err: unknown) => {
    console.error(`Torrent error [${id}]:`, err)
    upsertRecord(id, { status: 'error' })

    try {
      if (!torrent.destroyed) torrent.destroy()
    } catch {
      // ignore
    }
    removeActiveDownload(id)
    emitProgressUpdate()
    if (activeDownloadMapSize() === 0) stopProgressBroadcast()

    processQueue().catch((e) =>
      console.error('[download-manager] processQueue after error failed:', e)
    )
  })

  torrent.on('done', () => {
    handleTorrentComplete(id, managed).catch((e) =>
      console.error('[download-manager] handleTorrentComplete failed:', e)
    )
  })

  upsertRecord(id, { status: 'downloading' })
  startProgressBroadcast(() => getAllDownloadItems(getActiveDownloadsMap()), persistAllProgress)
  return true
}

// ---------- Completion ----------

/** Handle torrent completion: persist, cleanup, and auto-add to library. */
async function handleTorrentComplete(id: string, managed: ManagedDownload): Promise<void> {
  const torrent = managed.torrent!

  upsertRecord(id, {
    status: 'completed',
    progress: 1,
    downloaded: safeNum(torrent.downloaded),
    totalSize: safeNum(torrent.length),
    completedAt: new Date().toISOString()
  })

  try {
    torrent.destroy()
    removeActiveDownload(id)
    if (activeDownloadMapSize() === 0) stopProgressBroadcast()
  } catch (err) {
    console.error('Failed to destroy torrent after completion:', err)
  }

  emitProgressUpdate()

  if (managed.imdbId) {
    try {
      await addCompletedMovieToLibrary(managed.imdbId, managed.savePath, torrent.name)
    } catch (err) {
      console.error('[download-manager] Failed to add completed movie to library:', err)
    }
  }

  // A slot freed up — start the next queued download
  await processQueue()
}

// ---------- Wire re-announce ----------

/**
 * When the first few peer wires connect, trigger an extra re-announce.
 * New peers often exchange PEX tables, so announcing right after obtaining
 * the first connections bootstraps swarm discovery exponentially.
 */
function setupWireReannounce(id: string, torrent: WebTorrent.Torrent): void {
  let wireCount = 0
  const thresholds = new Set(WIRE_REANNOUNCE_THRESHOLDS)

  torrent.on('wire', () => {
    wireCount++
    if (thresholds.has(wireCount)) {
      console.log(`[download-manager] Wire #${wireCount} connected for ${id} — re-announcing`)
      try {
        reannounce(torrent)
      } catch {
        // ignore
      }
    }
  })
}

// ---------- Persistence ----------

/** Persist progress of all active in-memory downloads to the JSON store. */
export function persistAllProgress(): void {
  for (const [id, dl] of getActiveDownloadsMap()) {
    const t = dl.torrent
    if (t && !t.destroyed && !t.done) {
      upsertRecord(id, {
        progress: safeNum(t.progress),
        downloaded: safeNum(t.downloaded),
        totalSize: safeNum(t.length)
      })
    }
  }
}
