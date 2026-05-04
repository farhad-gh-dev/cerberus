import { app } from 'electron'
import { join } from 'path'
import { readFileSync, existsSync } from 'fs'
import type { DownloadItem } from '../../shared/types'
import { createJsonWriter } from './json-writer'

// ---------- Types ----------

export interface DownloadRecord {
  id: string
  name: string
  magnetLink: string
  savePath: string
  imdbId?: string
  isCustom?: boolean
  status: DownloadItem['status']
  progress: number
  downloaded: number
  totalSize: number
  startedAt: string
  completedAt?: string
  priority: number
  rootPath?: string
}

interface DownloadStore {
  records: DownloadRecord[]
}

// ---------- State ----------

const STORE_FILE = join(app.getPath('userData'), 'downloads.json')

let store: DownloadStore | null = null
// id → records[] index; rebuild after any reorder/remove.
const idIndex = new Map<string, number>()
const writer = createJsonWriter<DownloadStore>(STORE_FILE)

function rebuildIndex(records: DownloadRecord[]): void {
  idIndex.clear()
  for (let i = 0; i < records.length; i++) idIndex.set(records[i].id, i)
}

// ---------- Public API ----------

export function loadStore(): DownloadStore {
  if (store) return store
  if (existsSync(STORE_FILE)) {
    try {
      store = JSON.parse(readFileSync(STORE_FILE, 'utf-8'))
    } catch {
      store = { records: [] }
    }
  } else {
    store = { records: [] }
  }
  rebuildIndex(store!.records)
  return store!
}

export function saveStore(): void {
  writer.schedule(loadStore())
}

export function flushStoreSync(): void {
  writer.flushSync()
}

export function upsertRecord(id: string, update: Partial<DownloadRecord>): void {
  const s = loadStore()
  const at = idIndex.get(id)
  if (at !== undefined) {
    s.records[at] = { ...s.records[at], ...update }
  } else {
    if (!update.id || !update.name || !update.magnetLink || !update.savePath) {
      console.error('[download-store] insert missing required fields for', id, update)
      return
    }
    idIndex.set(id, s.records.length)
    s.records.push(update as DownloadRecord)
  }
  saveStore()
}

export function removeRecord(id: string): void {
  const s = loadStore()
  if (!idIndex.has(id)) return
  s.records = s.records.filter((r) => r.id !== id)
  rebuildIndex(s.records)
  saveStore()
}

export function getRecord(id: string): DownloadRecord | undefined {
  const s = loadStore()
  const at = idIndex.get(id)
  return at !== undefined ? s.records[at] : undefined
}

export function getAllRecords(): DownloadRecord[] {
  return loadStore().records
}

/** Return the next available priority number (max + 1). */
export function nextPriority(): number {
  const s = loadStore()
  if (s.records.length === 0) return 0
  const maxPriority = s.records.reduce((max, r) => Math.max(max, r.priority ?? 0), 0)
  return maxPriority + 1
}

/** Get all queued records ordered by priority (lowest = highest priority). */
export function getQueuedRecords(): DownloadRecord[] {
  return loadStore()
    .records.filter((r) => r.status === 'queued')
    .sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity))
}

/** Swap the priority of two records. */
export function swapPriority(idA: string, idB: string): void {
  const s = loadStore()
  const ai = idIndex.get(idA)
  const bi = idIndex.get(idB)
  if (ai === undefined || bi === undefined) return
  const a = s.records[ai]
  const b = s.records[bi]
  const tmp = a.priority
  a.priority = b.priority
  b.priority = tmp
  saveStore()
}

/** Reassign priorities to match the given order (first ID = highest priority). */
export function reorderQueueRecords(orderedIds: string[]): void {
  const s = loadStore()
  for (let i = 0; i < orderedIds.length; i++) {
    const at = idIndex.get(orderedIds[i])
    if (at === undefined) continue
    const record = s.records[at]
    if (record.status === 'queued') {
      record.priority = i
    }
  }
  saveStore()
}
