import { randomUUID } from 'crypto'
import type { DownloadItem, PeerInfo } from '../../shared/types'
import { addCompletedMovieToLibrary } from './library'
import { getSetting } from './settings'
import { ANNOUNCE_TRACKERS } from '../config/trackers'
import { upsertRecord, removeRecord, getRecord } from './download-store'
import { getClient } from './torrent-client'
import {
  startProgressBroadcast,
  stopProgressBroadcast,
  emitProgressUpdate
} from './progress-broadcaster'
import { getPeers as getPeerInfo } from './peer-info'
import { safeNum } from './download-helpers'
import { reannounce, startReannounceLoop } from './torrent-reannounce'
import { type ManagedDownload, getAllDownloadItems } from './download-items'

// ---------- In-memory active downloads ----------

const downloads = new Map<string, ManagedDownload>()

// ---------- Internal helpers ----------

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
    downloads.delete(id)
    if (downloads.size === 0) stopProgressBroadcast()
  } catch (err) {
    console.error('Failed to destroy torrent after completion:', err)
  }

  emitProgressUpdate()

  if (managed.imdbId) {
    await addCompletedMovieToLibrary(managed.imdbId, managed.savePath, torrent.name)
  }
}

// ---------- Public API ----------

export async function startDownload(
  magnetLink: string,
  name: string,
  savePath?: string,
  imdbId?: string,
  isCustom?: boolean
): Promise<string> {
  const wt = await getClient()
  const id = randomUUID()
  const path = savePath || getSetting('downloadPath')

  const managed: ManagedDownload = {
    id,
    torrent: null,
    name,
    magnetLink,
    savePath: path,
    imdbId,
    isCustom
  }
  downloads.set(id, managed)

  upsertRecord(id, {
    id,
    name,
    magnetLink,
    savePath: path,
    imdbId,
    isCustom,
    status: 'downloading',
    progress: 0,
    downloaded: 0,
    totalSize: 0,
    startedAt: new Date().toISOString()
  })

  const torrent = wt.add(magnetLink, { path, announce: ANNOUNCE_TRACKERS })
  managed.torrent = torrent

  startReannounceLoop(id, torrent)

  torrent.on('error', (err: unknown) => {
    console.error(`Torrent error [${id}]:`, err)
    upsertRecord(id, { status: 'error' })
  })

  torrent.on('done', () => handleTorrentComplete(id, managed))

  startProgressBroadcast(() => getAllDownloadItems(downloads))
  return id
}

export async function pauseDownload(id: string): Promise<boolean> {
  const dl = downloads.get(id)
  if (!dl?.torrent || dl.torrent.done) return false
  const torrent = dl.torrent
  torrent.pause()

  for (const wire of [...(torrent.wires || [])]) {
    try {
      wire.destroy?.()
    } catch (err) {
      console.warn('[download-manager] Failed to destroy wire:', err)
    }
  }

  upsertRecord(id, { status: 'paused', progress: safeNum(torrent.progress) })
  emitProgressUpdate()
  return true
}

export async function resumeDownload(id: string): Promise<boolean> {
  const dl = downloads.get(id)

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
  const record = getRecord(id)
  if (!record || record.status === 'completed') return false

  const wt = await getClient()

  const managed: ManagedDownload = {
    id: record.id,
    torrent: null,
    name: record.name,
    magnetLink: record.magnetLink,
    savePath: record.savePath,
    imdbId: record.imdbId,
    isCustom: record.isCustom,
    lastProgress: record.progress,
    lastDownloaded: record.downloaded,
    lastTotalSize: record.totalSize
  }
  downloads.set(id, managed)

  const torrent = wt.add(record.magnetLink, {
    path: record.savePath,
    announce: ANNOUNCE_TRACKERS
  })
  managed.torrent = torrent

  startReannounceLoop(id, torrent)

  torrent.on('error', (err: unknown) => {
    console.error(`Torrent error [${id}]:`, err)
    upsertRecord(id, { status: 'error' })
  })

  torrent.on('done', () => handleTorrentComplete(id, managed))

  upsertRecord(id, { status: 'downloading' })
  startProgressBroadcast(() => getAllDownloadItems(downloads))
  return true
}

export async function cancelDownload(id: string): Promise<boolean> {
  const dl = downloads.get(id)
  if (dl) {
    if (dl.torrent) dl.torrent.destroy()
    downloads.delete(id)
  }
  removeRecord(id)
  emitProgressUpdate()
  if (downloads.size === 0) stopProgressBroadcast()
  return true
}

export async function deleteDownload(id: string): Promise<boolean> {
  if (downloads.has(id)) {
    return cancelDownload(id)
  }
  removeRecord(id)
  emitProgressUpdate()
  return true
}

export async function getDownloads(): Promise<DownloadItem[]> {
  return getAllDownloadItems(downloads)
}

export async function getPeers(downloadId: string): Promise<PeerInfo[]> {
  const dl = downloads.get(downloadId)
  if (!dl?.torrent) {
    console.log('[getPeers] No torrent found for', downloadId)
    console.log('[getPeers] Active download IDs:', [...downloads.keys()])
    return []
  }

  return getPeerInfo(dl.torrent, dl.torrent.pieces?.length || 1)
}
