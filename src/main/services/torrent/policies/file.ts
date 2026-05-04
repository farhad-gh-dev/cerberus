import type WebTorrent from 'webtorrent'

const EXTRA_PATTERNS: RegExp[] = [
  /(^|[\\/])sample[^\\/]*$/i,
  /\.nfo$/i,
  /\.txt$/i,
  /\.url$/i,
  /\.sfv$/i
]

const VIDEO_EXT = new Set(['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v', '.wmv'])

export function isExtra(filePath: string): boolean {
  return EXTRA_PATTERNS.some((rx) => rx.test(filePath))
}

/**
 * Deselect files that look like extras for a normal download.
 * Returns the list of files that remain selected — the caller treats
 * "all of these are file.done" as "torrent complete", because webtorrent's
 * own `_checkDone` requires *every* file's pieces to be in the bitfield
 * (deselected files would block the torrent's 'done' event forever).
 */
export function deselectExtras(torrent: WebTorrent.Torrent): {
  selected: WebTorrent.File[]
  deselectedCount: number
} {
  const selected: WebTorrent.File[] = []
  let deselectedCount = 0
  for (const f of torrent.files) {
    if (isExtra(f.path)) {
      try {
        f.deselect?.()
        deselectedCount++
      } catch {
        // ignore — webtorrent's File.deselect throws if already torn down
      }
    } else {
      selected.push(f)
    }
  }
  return { selected, deselectedCount }
}

/** Locate the largest video file in a torrent (used for streaming). */
export function findVideoFile(torrent: WebTorrent.Torrent): WebTorrent.File | null {
  let largest: WebTorrent.File | null = null
  for (const f of torrent.files) {
    const ext = '.' + (f.name.split('.').pop()?.toLowerCase() ?? '')
    if (!VIDEO_EXT.has(ext)) continue
    if (!largest || f.length > largest.length) largest = f
  }
  return largest
}

/** Deselect every file in a torrent except the given target. */
export function selectOnly(torrent: WebTorrent.Torrent, keep: WebTorrent.File): void {
  for (const f of torrent.files) {
    if (f === keep) {
      f.select?.()
    } else {
      f.deselect?.()
    }
  }
}
