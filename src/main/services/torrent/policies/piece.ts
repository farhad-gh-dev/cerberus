import type WebTorrent from 'webtorrent'

/** Bytes worth of pieces to mark critical at the head of a stream. */
const HEAD_WINDOW_BYTES = 60 * 1024 * 1024
/** Bytes worth of pieces to mark critical at the tail (mp4 moov atom). */
const TAIL_WINDOW_BYTES = 8 * 1024 * 1024

const TAIL_SENSITIVE_EXT = new Set(['.mp4', '.m4v', '.mov'])

function pieceCount(byteLength: number, pieceLength: number): number {
  return Math.max(1, Math.ceil(byteLength / Math.max(1, pieceLength)))
}

/**
 * Mark a head window critical so the player can begin decoding immediately,
 * and (only for moov-at-end formats) a tail window so seeking works without
 * stalling at the end of the file.
 */
export function applyStreamingPriority(torrent: WebTorrent.Torrent, fileExtension: string): void {
  const total = torrent.pieces?.length ?? 0
  const pieceLen = torrent.pieceLength ?? 0
  if (total === 0 || pieceLen === 0) return

  const head = Math.min(total, pieceCount(HEAD_WINDOW_BYTES, pieceLen))
  torrent.critical?.(0, head - 1)

  if (TAIL_SENSITIVE_EXT.has(fileExtension.toLowerCase())) {
    const tail = Math.min(total, pieceCount(TAIL_WINDOW_BYTES, pieceLen))
    if (total > tail) torrent.critical?.(total - tail, total - 1)
  }
}

/**
 * Re-prioritize a window starting at `byteOffset` after a seek. Returns the
 * piece range marked critical, or null if the torrent has no pieces yet.
 */
export function applySeekPriority(
  torrent: WebTorrent.Torrent,
  byteOffset: number
): { start: number; end: number } | null {
  const total = torrent.pieces?.length ?? 0
  const pieceLen = torrent.pieceLength ?? 0
  if (total === 0 || pieceLen === 0) return null

  const target = Math.floor(byteOffset / pieceLen)
  const window = pieceCount(HEAD_WINDOW_BYTES, pieceLen)
  const start = Math.max(0, target)
  const end = Math.min(total - 1, target + window - 1)
  torrent.critical?.(start, end)
  return { start, end }
}
