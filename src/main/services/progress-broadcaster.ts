import { BrowserWindow } from 'electron'
import type { DownloadItem } from '../../shared/types'

type ItemsProvider = () => DownloadItem[]
type PersistCallback = () => void

let progressInterval: ReturnType<typeof setInterval> | null = null
let getItems: ItemsProvider | null = null
let persistFn: PersistCallback | null = null
let tickCount = 0

let lastSent = new Map<string, DownloadItem>()

/** Persist every N ticks (1 tick = 1s). */
const PERSIST_EVERY_N_TICKS = 5

function send(items: DownloadItem[]): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('download:progress', items)
  }
}

// Mirrors the renderer's shallowEqualItem — match it when adding fields.
function unchanged(a: DownloadItem, b: DownloadItem): boolean {
  return (
    a.status === b.status &&
    a.progress === b.progress &&
    a.downloadSpeed === b.downloadSpeed &&
    a.uploadSpeed === b.uploadSpeed &&
    a.downloaded === b.downloaded &&
    a.totalSize === b.totalSize &&
    a.timeRemaining === b.timeRemaining &&
    a.peers === b.peers &&
    a.priority === b.priority &&
    a.completedAt === b.completedAt &&
    a.name === b.name
  )
}

function broadcastProgress(force = false): void {
  if (!getItems) return
  const items = getItems()

  const sizeChanged = items.length !== lastSent.size
  let anyChanged = sizeChanged
  if (!anyChanged) {
    for (const item of items) {
      const prev = lastSent.get(item.id)
      if (!prev || !unchanged(prev, item)) {
        anyChanged = true
        break
      }
    }
  }

  if (anyChanged || force) {
    send(items)
    const next = new Map<string, DownloadItem>()
    for (const item of items) next.set(item.id, item)
    lastSent = next
  }

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
  lastSent = new Map()
  progressInterval = setInterval(broadcastProgress, 1000)
}

export function stopProgressBroadcast(): void {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  lastSent = new Map()
}

/** Forces an immediate send (skips the diff check) for state-change events. */
export function emitProgressUpdate(items?: DownloadItem[]): void {
  if (getItems) {
    broadcastProgress(true)
  } else if (items) {
    send(items)
    const next = new Map<string, DownloadItem>()
    for (const item of items) next.set(item.id, item)
    lastSent = next
  }
}
