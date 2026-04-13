import { randomUUID } from 'crypto'
import type { DownloadItem, PeerInfo } from '../../shared/types'
import { getActiveDownload, activeDownloadMapSize, getActiveDownloadsMap } from './download-state'
import { activeDownloadCount } from './download-queue'
import { activateDownload, persistAllProgress } from './download-activation'
import { upsertRecord, getAllRecords, nextPriority } from './download-store'
import { getSetting } from './settings'
import { startProgressBroadcast, emitProgressUpdate } from './progress-broadcaster'
import { getAllDownloadItems } from './download-items'
import { getPeers as getPeerInfo } from './peer-info'

// ---------- Public API ----------

export async function startDownload(
  magnetLink: string,
  name: string,
  savePath?: string,
  imdbId?: string,
  isCustom?: boolean
): Promise<string> {
  // Duplicate detection: check if we already have this magnet link
  const existing = getAllRecords().find(
    (r) => r.magnetLink === magnetLink && r.status !== 'error' && r.status !== 'on-hold'
  )
  if (existing) {
    console.warn(
      `[download-manager] Duplicate magnet link detected, returning existing ID: ${existing.id}`
    )
    return existing.id
  }

  const id = randomUUID()
  const path = savePath || getSetting('downloadPath')
  const priority = nextPriority()
  const shouldQueue = activeDownloadCount() >= getSetting('maxConcurrentDownloads')

  // Always persist the record up-front
  upsertRecord(id, {
    id,
    name,
    magnetLink,
    savePath: path,
    imdbId,
    isCustom,
    status: shouldQueue ? 'queued' : 'downloading',
    progress: 0,
    downloaded: 0,
    totalSize: 0,
    priority,
    startedAt: new Date().toISOString()
  })

  if (shouldQueue) {
    emitProgressUpdate()
    // Keep the periodic broadcast running if other downloads are active
    if (activeDownloadMapSize() > 0) {
      startProgressBroadcast(() => getAllDownloadItems(getActiveDownloadsMap()), persistAllProgress)
    }
    return id
  }

  // Start immediately — activateDownload reads the persisted record
  await activateDownload(id)
  return id
}

export async function getDownloads(): Promise<DownloadItem[]> {
  return getAllDownloadItems(getActiveDownloadsMap())
}

export async function getPeers(downloadId: string): Promise<PeerInfo[]> {
  const dl = getActiveDownload(downloadId)
  if (!dl?.torrent) {
    console.log('[getPeers] No torrent found for', downloadId)
    console.log('[getPeers] Active download IDs:', [...getActiveDownloadsMap().keys()])
    return []
  }

  return getPeerInfo(dl.torrent, dl.torrent.pieces?.length || 1)
}
