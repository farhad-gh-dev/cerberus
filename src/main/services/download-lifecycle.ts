import { getActiveDownloadsMap, clearActiveDownloads } from './download-state'
import { getAllRecords, upsertRecord } from './download-store'
import { safeNum } from './download-helpers'
import { stopProgressBroadcast } from './progress-broadcaster'
import { processQueue, registerActivator } from './download-queue'
import { activateDownload } from './download-activation'

/**
 * Called once at app startup.
 * Resets any stale 'downloading' or 'paused' records to 'queued' (the torrent
 * is gone after a restart). They'll auto-start via processQueue when slots open.
 */
export async function initDownloads(): Promise<void> {
  // Wire queue → activation once so processQueue can start downloads
  // without a circular import between download-queue and download-activation.
  registerActivator(activateDownload)

  const records = getAllRecords()
  for (const r of records) {
    if (r.status === 'downloading' || r.status === 'paused') {
      upsertRecord(r.id, { status: 'queued' })
    }
  }

  await processQueue()
}

/**
 * Called before the app quits.
 * Persists current progress of every active download and tears down torrents.
 */
export function shutdownDownloads(): void {
  for (const [id, dl] of getActiveDownloadsMap()) {
    const t = dl.torrent
    if (t && !t.destroyed) {
      upsertRecord(id, {
        status: t.done ? 'completed' : 'queued',
        progress: safeNum(t.progress),
        downloaded: safeNum(t.downloaded),
        totalSize: safeNum(t.length)
      })
      try {
        t.destroy()
      } catch {
        // ignore
      }
    }
  }
  clearActiveDownloads()
  stopProgressBroadcast()
}
