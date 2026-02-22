import { BrowserWindow } from 'electron'
import type { DownloadItem } from '../../shared/types'

type ItemsProvider = () => DownloadItem[]

let progressInterval: ReturnType<typeof setInterval> | null = null
let getItems: ItemsProvider | null = null

function broadcastProgress(): void {
  if (!getItems) return
  const items = getItems()
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('download:progress', items)
  }
}

export function startProgressBroadcast(provider: ItemsProvider): void {
  getItems = provider
  if (progressInterval) return
  progressInterval = setInterval(broadcastProgress, 1000)
}

export function stopProgressBroadcast(): void {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

/** Send a single immediate update to all windows. */
export function emitProgressUpdate(): void {
  broadcastProgress()
}
