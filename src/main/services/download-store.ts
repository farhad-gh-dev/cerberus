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
