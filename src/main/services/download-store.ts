import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import type { DownloadItem } from '../../shared/types'

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
}

interface DownloadStore {
  records: DownloadRecord[]
}

// ---------- State ----------

const STORE_FILE = join(app.getPath('userData'), 'downloads.json')

let store: DownloadStore | null = null

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
  return store!
}

export function saveStore(): void {
  writeFileSync(STORE_FILE, JSON.stringify(loadStore(), null, 2))
}

export function upsertRecord(id: string, update: Partial<DownloadRecord>): void {
  const s = loadStore()
  const idx = s.records.findIndex((r) => r.id === id)
  if (idx !== -1) {
    s.records[idx] = { ...s.records[idx], ...update }
  } else {
    s.records.push(update as DownloadRecord)
  }
  saveStore()
}

export function removeRecord(id: string): void {
  const s = loadStore()
  s.records = s.records.filter((r) => r.id !== id)
  saveStore()
}

export function getRecord(id: string): DownloadRecord | undefined {
  return loadStore().records.find((r) => r.id === id)
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
  const a = s.records.find((r) => r.id === idA)
  const b = s.records.find((r) => r.id === idB)
  if (!a || !b) return
  const tmp = a.priority
  a.priority = b.priority
  b.priority = tmp
  saveStore()
}

/** Reassign priorities to match the given order (first ID = highest priority). */
export function reorderQueueRecords(orderedIds: string[]): void {
  const s = loadStore()
  for (let i = 0; i < orderedIds.length; i++) {
    const record = s.records.find((r) => r.id === orderedIds[i])
    if (record && record.status === 'queued') {
      record.priority = i
    }
  }
  saveStore()
}
