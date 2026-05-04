import type { DownloadItem } from '../../../shared/types'
import type { DownloadRecord } from '../download-store'
import type { TorrentSession } from './session'
import { persistedStatus } from './state'
import { safeNum } from '../download-helpers'

/**
 * Build a DownloadItem from a live session + persisted record. Status
 * always comes from the FSM — never derived from torrent flags.
 *
 * webtorrent's `progress`, `downloaded`, and `timeRemaining` are getters
 * that each walk the full pieces array. Read each one ONCE here — the
 * 1 Hz broadcaster otherwise pays O(numPieces) three times per session
 * per tick, which is visible jank near completion when the rarity map
 * is also churning.
 */
export function buildItem(session: TorrentSession, record: DownloadRecord): DownloadItem {
  const t = session.getTorrent()
  const hasMetadata = !!t && t.length > 0

  let progress: number
  let downloaded: number
  let totalSize: number
  let timeRemaining: number
  let downloadSpeed: number
  let uploadSpeed: number
  let peers: number

  if (hasMetadata) {
    const length = safeNum(t!.length)
    const downloadedRaw = safeNum(t!.downloaded)
    const speed = safeNum(t!.downloadSpeed)
    downloaded = downloadedRaw
    totalSize = length
    progress = length > 0 ? downloadedRaw / length : 0
    timeRemaining = speed > 0 ? ((length - downloadedRaw) / speed) * 1000 : Infinity
    downloadSpeed = speed
    uploadSpeed = safeNum(t!.uploadSpeed)
    peers = safeNum(t!.numPeers)
  } else {
    progress = safeNum(record.progress)
    downloaded = safeNum(record.downloaded)
    totalSize = safeNum(record.totalSize)
    timeRemaining = Infinity
    downloadSpeed = safeNum(t?.downloadSpeed)
    uploadSpeed = safeNum(t?.uploadSpeed)
    peers = safeNum(t?.numPeers)
  }

  return {
    id: record.id,
    name: record.name,
    magnetLink: record.magnetLink,
    savePath: record.savePath,
    imdbId: record.imdbId,
    status: persistedStatus(session.getState()),
    progress,
    downloadSpeed,
    uploadSpeed,
    downloaded,
    totalSize,
    timeRemaining,
    peers,
    isCustom: record.isCustom,
    priority: record.priority ?? 0,
    completedAt: record.completedAt
  }
}

/** Build a DownloadItem from a record only (no live session). */
export function buildItemFromRecord(r: DownloadRecord): DownloadItem {
  return {
    id: r.id,
    name: r.name,
    magnetLink: r.magnetLink,
    savePath: r.savePath,
    imdbId: r.imdbId,
    status: r.status,
    progress: r.progress,
    downloadSpeed: 0,
    uploadSpeed: 0,
    downloaded: r.downloaded,
    totalSize: r.totalSize,
    timeRemaining: 0,
    peers: 0,
    isCustom: r.isCustom,
    priority: r.priority ?? 0,
    completedAt: r.completedAt
  }
}
