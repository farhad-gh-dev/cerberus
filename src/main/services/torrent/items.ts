import type WebTorrent from 'webtorrent'
import type { DownloadItem } from '../../../shared/types'
import type { DownloadRecord } from '../download-store'
import type { TorrentSession } from './session'
import { persistedStatus } from './state'
import { safeNum } from '../download-helpers'

interface BitfieldLike {
  get(i: number): boolean
}

/** Bytes from fully verified pieces only (excludes in-progress blocks). */
function verifiedBytes(t: WebTorrent.Torrent): number {
  const internal = t as unknown as { bitfield?: BitfieldLike; pieceLength?: number }
  const bitfield = internal.bitfield
  const pieceLength = internal.pieceLength
  const length = safeNum(t.length)
  if (!bitfield || !pieceLength || length <= 0) return safeNum(t.downloaded)
  const numPieces = Math.ceil(length / pieceLength)
  const lastPieceLength = length - (numPieces - 1) * pieceLength
  let bytes = 0
  for (let i = 0; i < numPieces; i++) {
    if (bitfield.get(i)) bytes += i === numPieces - 1 ? lastPieceLength : pieceLength
  }
  return bytes
}

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
    // Verified-only so the UI doesn't regress when an end-game piece hash-fails.
    const verified = verifiedBytes(t!)
    const speed = safeNum(t!.downloadSpeed)
    downloaded = verified
    totalSize = length
    progress = length > 0 ? verified / length : 0
    timeRemaining = speed > 0 ? ((length - verified) / speed) * 1000 : Infinity
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
