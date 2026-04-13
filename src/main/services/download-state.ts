import type { ManagedDownload } from './download-items'

/**
 * Shared in-memory state for active downloads.
 * Only downloads with a live WebTorrent instance are stored here.
 * Completed, queued, and on-hold downloads live only in the persisted store.
 */
const downloads = new Map<string, ManagedDownload>()

export function getActiveDownload(id: string): ManagedDownload | undefined {
  return downloads.get(id)
}

export function setActiveDownload(id: string, dl: ManagedDownload): void {
  downloads.set(id, dl)
}

export function removeActiveDownload(id: string): boolean {
  return downloads.delete(id)
}

export function hasActiveDownload(id: string): boolean {
  return downloads.has(id)
}

/** Number of entries in the active downloads map (includes all states). */
export function activeDownloadMapSize(): number {
  return downloads.size
}

export function clearActiveDownloads(): void {
  downloads.clear()
}

/**
 * Returns the underlying Map. Prefer the accessor helpers above for
 * single-entry operations; use this only when you need to iterate.
 */
export function getActiveDownloadsMap(): Map<string, ManagedDownload> {
  return downloads
}
