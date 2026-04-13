import {
  getActiveDownload,
  removeActiveDownload,
  hasActiveDownload,
  activeDownloadMapSize,
  getActiveDownloadsMap
} from './download-state'
import {
  activeDownloadCount,
  findOldestActiveDownload,
  demoteToQueue,
  processQueue
} from './download-queue'
import { activateDownload } from './download-activation'
import { upsertRecord, removeRecord, getRecord, nextPriority } from './download-store'
import { getSetting } from './settings'
import { stopProgressBroadcast, emitProgressUpdate } from './progress-broadcaster'
import { safeNum } from './download-helpers'
import { getAllDownloadItems } from './download-items'
import { reannounce } from './torrent-reannounce'

// ---------- Pause / Resume ----------

export async function pauseDownload(id: string): Promise<boolean> {
  const dl = getActiveDownload(id)
  if (!dl?.torrent || dl.torrent.done) return false
  const torrent = dl.torrent

  // Capture progress before destroying
  const progress = safeNum(torrent.progress)
  const downloaded = safeNum(torrent.downloaded)
  const totalSize = safeNum(torrent.length)

  // Destroy wires then the torrent itself
  for (const wire of [...(torrent.wires || [])]) {
    try {
      wire.destroy?.()
    } catch {
      // ignore
    }
  }
  try {
    torrent.destroy()
  } catch {
    // ignore
  }
  removeActiveDownload(id)

  // Move to the back of the queue so other queued items take priority
  const priority = nextPriority()
  upsertRecord(id, { status: 'queued', progress, downloaded, totalSize, priority })
  emitProgressUpdate()
  if (activeDownloadMapSize() === 0) stopProgressBroadcast()

  // A slot freed up — start the next queued download
  await processQueue()

  return true
}

export async function resumeDownload(id: string): Promise<boolean> {
  // Check if this is a queued download — force-start it, but enforce concurrency
  const record = getRecord(id)
  if (record?.status === 'queued') {
    const maxConcurrent = getSetting('maxConcurrentDownloads')

    // If at capacity, demote the oldest active download to free a slot
    while (activeDownloadCount() >= maxConcurrent) {
      const oldest = findOldestActiveDownload()
      if (!oldest) break
      await demoteToQueue(oldest)
    }

    await activateDownload(id)
    emitProgressUpdate()
    return true
  }

  const dl = getActiveDownload(id)

  // Download is active in memory — just unpause it
  if (dl?.torrent && !dl.torrent.done) {
    dl.torrent.resume()

    try {
      reannounce(dl.torrent)
    } catch (err) {
      console.warn('[download-manager] Re-announce after resume failed:', err)
    }

    upsertRecord(id, { status: 'downloading' })
    emitProgressUpdate()
    return true
  }

  // Not in memory — re-hydrate from persisted store (e.g. app was restarted)
  if (!record || record.status === 'completed') return false

  const maxConcurrent = getSetting('maxConcurrentDownloads')
  if (activeDownloadCount() >= maxConcurrent) {
    // Queue it instead of starting immediately
    upsertRecord(id, { status: 'queued' })
    emitProgressUpdate()
    return true
  }

  await activateDownload(id)
  emitProgressUpdate()
  return true
}

// ---------- Cancel / Delete ----------

export async function cancelDownload(id: string): Promise<boolean> {
  const dl = getActiveDownload(id)
  if (dl) {
    try {
      if (dl.torrent && !dl.torrent.destroyed) dl.torrent.destroy()
    } catch (err) {
      console.warn('[download-manager] Failed to destroy torrent on cancel:', err)
    }
    removeActiveDownload(id)
  }
  removeRecord(id)
  emitProgressUpdate(getAllDownloadItems(getActiveDownloadsMap()))
  if (activeDownloadMapSize() === 0) stopProgressBroadcast()

  // A slot freed up — start the next queued download
  await processQueue()

  return true
}

export async function deleteDownload(id: string): Promise<boolean> {
  if (hasActiveDownload(id)) {
    return cancelDownload(id)
  }
  removeRecord(id)
  emitProgressUpdate(getAllDownloadItems(getActiveDownloadsMap()))

  // Check queue in case a queued item was deleted
  await processQueue()

  return true
}

// ---------- Hold / Unhold ----------

/**
 * Put a download on hold — it won't auto-start from the queue.
 * If the download is currently active, pause and destroy the torrent first.
 */
export async function holdDownload(id: string): Promise<boolean> {
  const dl = getActiveDownload(id)
  if (dl?.torrent && !dl.torrent.destroyed) {
    const torrent = dl.torrent
    const progress = safeNum(torrent.progress)
    const downloaded = safeNum(torrent.downloaded)
    const totalSize = safeNum(torrent.length)

    torrent.pause()
    try {
      torrent.destroy()
    } catch {
      // ignore
    }
    removeActiveDownload(id)

    upsertRecord(id, { status: 'on-hold', progress, downloaded, totalSize })
  } else {
    // Not active (queued, paused, error) — just mark on-hold
    upsertRecord(id, { status: 'on-hold' })
    removeActiveDownload(id)
  }

  emitProgressUpdate(getAllDownloadItems(getActiveDownloadsMap()))
  if (activeDownloadMapSize() === 0) stopProgressBroadcast()

  // A slot may have freed — start the next queued download
  await processQueue()

  return true
}

/**
 * Move an on-hold download back to the queue so it can auto-start.
 */
export async function unholdDownload(id: string): Promise<boolean> {
  const record = getRecord(id)
  if (!record || record.status !== 'on-hold') return false

  upsertRecord(id, { status: 'queued' })
  emitProgressUpdate(getAllDownloadItems(getActiveDownloadsMap()))

  // Try to start it immediately if there's a free slot
  await processQueue()

  return true
}
