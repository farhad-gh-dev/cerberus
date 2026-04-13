import { BrowserWindow } from 'electron'
import type { DownloadItem } from '../../shared/types'

type ItemsProvider = () => DownloadItem[]
type PersistCallback = () => void

let progressInterval: ReturnType<typeof setInterval> | null = null
let getItems: ItemsProvider | null = null
let persistFn: PersistCallback | null = null
let tickCount = 0

/** How often (in ticks) to persist progress to disk. Each tick = 1 s. */
const PERSIST_EVERY_N_TICKS = 5

function broadcastProgress(): void {
  if (!getItems) return
  const items = getItems()
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('download:progress', items)
  }

  // Periodically persist progress so it survives crashes / unclean exits
  tickCount++
  if (persistFn && tickCount % PERSIST_EVERY_N_TICKS === 0) {
    persistFn()
  }
}

export function startProgressBroadcast(provider: ItemsProvider, onPersist?: PersistCallback): void {
  getItems = provider
  if (onPersist) persistFn = onPersist
  if (progressInterval) return
  tickCount = 0
  progressInterval = setInterval(broadcastProgress, 1000)
}

export function stopProgressBroadcast(): void {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

/** Send a single immediate update to all windows.
 *  If the periodic broadcaster hasn't been started yet (no active torrent),
 *  pass `items` directly so the UI still receives the update.
 */
export function emitProgressUpdate(items?: DownloadItem[]): void {
  if (getItems) {
    broadcastProgress()
  } else if (items) {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send('download:progress', items)
    }
  }
}
