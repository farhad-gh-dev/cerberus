import { getActiveDownload, removeActiveDownload, getActiveDownloadsMap } from './download-state'
import {
  upsertRecord,
  getQueuedRecords,
  swapPriority,
  reorderQueueRecords,
  nextPriority
} from './download-store'
import { safeNum } from './download-helpers'
import { getSetting } from './settings'
import { emitProgressUpdate } from './progress-broadcaster'
import { getAllDownloadItems } from './download-items'

// ---------- Activator registration ----------

let activator: ((id: string) => Promise<boolean>) | null = null

/**
 * Register the function that starts a queued download.
 * Called once at app startup (from download-lifecycle) to break the
 * circular dependency between this module and download-activation.
 */
export function registerActivator(fn: (id: string) => Promise<boolean>): void {
  activator = fn
}

// ---------- Active-count helpers ----------

/** Count downloads that are actively transferring data (have a live torrent). */
export function activeDownloadCount(): number {
  let count = 0
  for (const dl of getActiveDownloadsMap().values()) {
    if (dl.torrent && !dl.torrent.done && !dl.torrent.paused && !dl.torrent.destroyed) count++
  }
  return count
}

/** Find the oldest (lowest priority number = started earliest) active download to demote. */
export function findOldestActiveDownload(): string | null {
  let oldest: { id: string; priority: number } | null = null
  for (const dl of getActiveDownloadsMap().values()) {
    if (dl.torrent && !dl.torrent.done && !dl.torrent.paused && !dl.torrent.destroyed) {
      const p = dl.priority ?? 0
      if (!oldest || p < oldest.priority) {
        oldest = { id: dl.id, priority: p }
      }
    }
  }
  return oldest?.id ?? null
}

// ---------- Queue operations ----------

/** Pause an active download and move it back to the queue. */
export async function demoteToQueue(id: string): Promise<void> {
  const dl = getActiveDownload(id)
  if (!dl?.torrent) return

  const torrent = dl.torrent

  torrent.pause()
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

  upsertRecord(id, {
    status: 'queued',
    progress: safeNum(torrent.progress),
    downloaded: safeNum(torrent.downloaded),
    totalSize: safeNum(torrent.length),
    priority: nextPriority()
  })
}

/** Attempt to start the next queued download if we have a free slot. */
export async function processQueue(): Promise<void> {
  if (!activator) {
    throw new Error('Queue activator not registered — call registerActivator() at startup')
  }
  const maxConcurrent = getSetting('maxConcurrentDownloads')
  const queued = getQueuedRecords()

  for (const record of queued) {
    if (activeDownloadCount() >= maxConcurrent) break
    await activator(record.id)
  }
}

// ---------- Queue reordering ----------

export async function moveInQueue(id: string, direction: 'up' | 'down'): Promise<boolean> {
  const queued = getQueuedRecords()
  const idx = queued.findIndex((r) => r.id === id)
  if (idx === -1) return false

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= queued.length) return false

  swapPriority(queued[idx].id, queued[swapIdx].id)
  emitProgressUpdate(getAllDownloadItems(getActiveDownloadsMap()))
  return true
}

export async function reorderQueue(orderedIds: string[]): Promise<boolean> {
  reorderQueueRecords(orderedIds)
  emitProgressUpdate(getAllDownloadItems(getActiveDownloadsMap()))
  return true
}
