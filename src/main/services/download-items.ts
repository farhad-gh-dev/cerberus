import type WebTorrent from 'webtorrent'
import type { DownloadItem } from '../../shared/types'
import { loadStore } from './download-store'
import { safeNum } from './download-helpers'

// ---------- Types ----------

export interface ManagedDownload {
  id: string
  torrent: WebTorrent.Torrent | null
  name: string
  magnetLink: string
  savePath: string
  imdbId?: string
  isCustom?: boolean
  /** Last-known progress (0–1) from the persisted store, used as fallback while metadata loads. */
  lastProgress?: number
  /** Last-known downloaded bytes from the persisted store. */
  lastDownloaded?: number
  /** Last-known total size from the persisted store. */
  lastTotalSize?: number
}

// ---------- Item builders ----------

export function buildItem(id: string, dl: ManagedDownload): DownloadItem {
  const t = dl.torrent
  const hasMetadata = t && t.length > 0

  return {
    id,
    name: dl.name,
    magnetLink: dl.magnetLink,
    savePath: dl.savePath,
    status: t ? (t.done ? 'completed' : t.paused ? 'paused' : 'downloading') : 'error',
    progress: hasMetadata ? safeNum(t.progress) : safeNum(dl.lastProgress),
    downloadSpeed: safeNum(t?.downloadSpeed),
    uploadSpeed: safeNum(t?.uploadSpeed),
    downloaded: hasMetadata ? safeNum(t?.downloaded) : safeNum(dl.lastDownloaded),
    totalSize: hasMetadata ? safeNum(t?.length) : safeNum(dl.lastTotalSize),
    timeRemaining: hasMetadata ? safeNum(t.timeRemaining, Infinity) : Infinity,
    peers: safeNum(t?.numPeers),
    isCustom: dl.isCustom
  }
}

export function buildItemFromRecord(r: {
  id: string
  name: string
  magnetLink: string
  savePath: string
  status: DownloadItem['status']
  progress: number
  downloaded: number
  totalSize: number
  isCustom?: boolean
}): DownloadItem {
  return {
    id: r.id,
    name: r.name,
    magnetLink: r.magnetLink,
    savePath: r.savePath,
    status: r.status,
    progress: r.progress,
    downloadSpeed: 0,
    uploadSpeed: 0,
    downloaded: r.downloaded,
    totalSize: r.totalSize,
    timeRemaining: 0,
    peers: 0,
    isCustom: r.isCustom
  }
}

/**
 * Merge active in-memory downloads with persisted historical records
 * into a single list of DownloadItems.
 */
export function getAllDownloadItems(activeDownloads: Map<string, ManagedDownload>): DownloadItem[] {
  const s = loadStore()
  const activeIds = new Set<string>()
  const items: DownloadItem[] = []

  for (const [id, dl] of activeDownloads) {
    activeIds.add(id)
    items.push(buildItem(id, dl))
  }

  for (const record of s.records) {
    if (!activeIds.has(record.id)) {
      items.push(buildItemFromRecord(record))
    }
  }

  return items
}
