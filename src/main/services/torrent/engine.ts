import { randomUUID } from 'crypto'
import type { DownloadItem, PeerInfo } from '../../../shared/types'
import {
  upsertRecord,
  removeRecord,
  getRecord,
  getAllRecords,
  getQueuedRecords,
  nextPriority,
  swapPriority,
  reorderQueueRecords,
  flushStoreSync
} from '../download-store'
import { getSetting } from '../settings'
import {
  startProgressBroadcast,
  stopProgressBroadcast,
  emitProgressUpdate
} from '../progress-broadcaster'
import { getPeers as buildPeerList } from '../peer-info'
import { addCompletedMovieToLibrary } from '../library'
import { TorrentSession } from './session'
import { buildItem, buildItemFromRecord } from './items'
import { sanitizeMagnet } from './policies/magnet'
import { TorrentError, classify } from './errors'
import { destroyPools } from './pool'
import { safeNum } from '../download-helpers'

/**
 * The single public entry point for managing torrent downloads. Replaces
 * download-manager + download-actions + download-activation + download-
 * lifecycle + download-queue + download-state + download-items.
 */

const sessions = new Map<string, TorrentSession>()

// ────────────── lifecycle ──────────────

export async function initEngine(): Promise<void> {
  // Reset stale records that were active when the app last quit.
  for (const r of getAllRecords()) {
    if (r.status === 'downloading' || r.status === 'paused') {
      upsertRecord(r.id, { status: 'queued' })
    }
  }
  await processQueue()
}

export function shutdownEngine(): void {
  for (const [id, session] of sessions) {
    const t = session.getTorrent()
    if (t && !t.destroyed) {
      upsertRecord(id, {
        status: t.done ? 'completed' : 'queued',
        progress: safeNum(t.progress),
        downloaded: safeNum(t.downloaded),
        totalSize: safeNum(t.length)
      })
    }
    session.dispose()
  }
  sessions.clear()
  stopProgressBroadcast()
  flushStoreSync()
  destroyPools()
}

// ────────────── public API (called from IPC) ──────────────

export async function startDownload(
  rawMagnet: string,
  name: string,
  savePath?: string,
  imdbId?: string,
  isCustom?: boolean
): Promise<string> {
  let infoHash: string
  let cleanedMagnet: string
  try {
    const sanitized = sanitizeMagnet(rawMagnet)
    infoHash = sanitized.infoHash
    cleanedMagnet = sanitized.magnet
  } catch (err) {
    const e = err instanceof TorrentError ? err : classify(err)
    throw e
  }

  // Duplicate detection by info-hash, not by raw magnet text.
  const matches = getAllRecords().filter((r) => {
    try {
      return sanitizeMagnet(r.magnetLink).infoHash === infoHash
    } catch {
      return false
    }
  })

  // Reuse only if there is an active record for this magnet. Terminal states
  // (error, on-hold, completed) should allow a fresh download — the user may
  // have deleted the file or removed it from the library.
  const active = matches.find(
    (r) => r.status !== 'error' && r.status !== 'on-hold' && r.status !== 'completed'
  )
  if (active) {
    console.warn(`[engine] duplicate magnet (info-hash ${infoHash}); reusing ${active.id}`)
    return active.id
  }

  // Drop stale completed records so the downloads list doesn't accumulate
  // orphan entries pointing at files that may no longer exist.
  for (const m of matches) {
    if (m.status === 'completed') removeRecord(m.id)
  }

  const id = randomUUID()
  const path = savePath || getSetting('downloadPath')
  const priority = nextPriority()
  const shouldQueue = activeSessionCount() >= getSetting('maxConcurrentDownloads')

  upsertRecord(id, {
    id,
    name,
    magnetLink: cleanedMagnet,
    savePath: path,
    imdbId,
    isCustom,
    status: shouldQueue ? 'queued' : 'downloading',
    progress: 0,
    downloaded: 0,
    totalSize: 0,
    priority,
    startedAt: new Date().toISOString()
  })

  if (shouldQueue) {
    emitProgressUpdate()
    if (sessions.size > 0) ensureBroadcaster()
    return id
  }

  await activate(id)
  return id
}

export async function pauseDownload(id: string): Promise<boolean> {
  const session = sessions.get(id)
  if (!session) return false

  if (!session.pause()) return false
  upsertRecord(id, persistFromSession(session))
  emitProgressUpdate()
  return true
}

export async function resumeDownload(id: string): Promise<boolean> {
  // If the session is alive in memory, just unpause it.
  const live = sessions.get(id)
  if (live) {
    if (live.getState() === 'paused' && live.resume()) {
      upsertRecord(id, persistFromSession(live))
      emitProgressUpdate()
      return true
    }
    return false
  }

  // Not in memory → re-hydrate from the store.
  const record = getRecord(id)
  if (!record || record.status === 'completed') return false

  const cap = getSetting('maxConcurrentDownloads')
  if (record.status === 'queued' && activeSessionCount() < cap) {
    await activate(id)
    emitProgressUpdate()
    return true
  }

  if (record.status === 'queued') {
    // User force-resumed past capacity → free a slot by demoting the oldest.
    while (activeSessionCount() >= cap) {
      const oldest = oldestActiveId()
      if (!oldest) break
      const s = sessions.get(oldest)
      if (!s) break
      s.demote()
      sessions.delete(oldest)
      upsertRecord(oldest, { status: 'queued', priority: nextPriority() })
    }
    await activate(id)
    emitProgressUpdate()
    return true
  }

  // status was 'paused' or 'error' but no live session — re-activate as queued.
  upsertRecord(id, { status: activeSessionCount() < cap ? 'downloading' : 'queued' })
  if (activeSessionCount() < cap) {
    await activate(id)
  }
  emitProgressUpdate()
  return true
}

export async function cancelDownload(id: string): Promise<boolean> {
  const session = sessions.get(id)
  if (session) {
    session.dispose()
    sessions.delete(id)
  }
  removeRecord(id)
  emitProgressUpdate()
  if (sessions.size === 0) stopProgressBroadcast()
  await processQueue()
  return true
}

export async function deleteDownload(id: string): Promise<boolean> {
  return cancelDownload(id)
}

export async function holdDownload(id: string): Promise<boolean> {
  const session = sessions.get(id)
  if (session) {
    const t = session.getTorrent()
    const snapshot = persistFromSession(session)
    session.hold()
    sessions.delete(id)
    upsertRecord(id, { ...snapshot, status: 'on-hold' })
    if (t) {
      // ensure the latest live numbers persist
    }
  } else {
    upsertRecord(id, { status: 'on-hold' })
  }

  emitProgressUpdate()
  if (sessions.size === 0) stopProgressBroadcast()
  await processQueue()
  return true
}

export async function unholdDownload(id: string): Promise<boolean> {
  const record = getRecord(id)
  if (!record || record.status !== 'on-hold') return false

  upsertRecord(id, { status: 'queued' })
  emitProgressUpdate()
  await processQueue()
  return true
}

export async function moveInQueue(id: string, direction: 'up' | 'down'): Promise<boolean> {
  const queued = getQueuedRecords()
  const idx = queued.findIndex((r) => r.id === id)
  if (idx === -1) return false
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= queued.length) return false
  swapPriority(queued[idx].id, queued[swapIdx].id)
  emitProgressUpdate(getDownloads())
  return true
}

export async function reorderQueue(orderedIds: string[]): Promise<boolean> {
  reorderQueueRecords(orderedIds)
  emitProgressUpdate(getDownloads())
  return true
}

export function getDownloads(): DownloadItem[] {
  const items: DownloadItem[] = []
  const seen = new Set<string>()

  for (const [id, session] of sessions) {
    const r = getRecord(id)
    if (!r) continue
    items.push(buildItem(session, r))
    seen.add(id)
  }

  for (const r of getAllRecords()) {
    if (!seen.has(r.id)) items.push(buildItemFromRecord(r))
  }

  return items
}

export async function getPeers(id: string): Promise<PeerInfo[]> {
  const session = sessions.get(id)
  const t = session?.getTorrent()
  if (!t) return []
  return buildPeerList(t, t.pieces?.length ?? 1)
}

// ────────────── queue plumbing ──────────────

function activeSessionCount(): number {
  let n = 0
  for (const s of sessions.values()) {
    const st = s.getState()
    if (st === 'metadata' || st === 'downloading' || st === 'paused') n++
  }
  return n
}

function oldestActiveId(): string | null {
  let oldest: { id: string; priority: number } | null = null
  for (const s of sessions.values()) {
    const r = getRecord(s.id)
    if (!r) continue
    const st = s.getState()
    if (st !== 'metadata' && st !== 'downloading') continue
    const p = r.priority ?? 0
    if (!oldest || p < oldest.priority) oldest = { id: s.id, priority: p }
  }
  return oldest?.id ?? null
}

async function processQueue(): Promise<void> {
  const cap = getSetting('maxConcurrentDownloads')
  for (const r of getQueuedRecords()) {
    if (activeSessionCount() >= cap) break
    await activate(r.id)
  }
}

async function activate(id: string): Promise<void> {
  if (sessions.has(id)) return
  const record = getRecord(id)
  if (!record) return

  const session = new TorrentSession(
    {
      id,
      magnet: record.magnetLink,
      savePath: record.savePath,
      onDemote: () => {
        sessions.delete(id)
        upsertRecord(id, { status: 'queued', priority: nextPriority() })
        emitProgressUpdate()
        void processQueue()
      }
    },
    {
      onStateChange: (state, detail) => {
        if (state === 'error' && detail?.error) {
          upsertRecord(id, {
            ...persistFromSession(session),
            status: 'error'
          })
          sessions.delete(id)
          emitProgressUpdate()
          if (sessions.size === 0) stopProgressBroadcast()
          void processQueue()
        }
      },
      onComplete: () => {
        const live = persistFromSession(session)
        upsertRecord(id, {
          ...live,
          status: 'completed',
          progress: 1,
          completedAt: new Date().toISOString()
        })
        sessions.delete(id)
        emitProgressUpdate()
        if (sessions.size === 0) stopProgressBroadcast()

        if (record.imdbId) {
          const t = session.getTorrent()
          const torrentName = t?.name || record.name
          addCompletedMovieToLibrary(record.imdbId, record.savePath, torrentName).catch((err) =>
            console.error('[engine] addCompletedMovieToLibrary failed:', err)
          )
        }

        void processQueue()
      }
    }
  )

  sessions.set(id, session)

  try {
    await session.start()
  } catch (err) {
    const e = err instanceof TorrentError ? err : classify(err)
    console.error(`[engine] session.start failed for ${id}:`, e.kind, e.message)
    session.dispose()
    sessions.delete(id)
    upsertRecord(id, { status: 'error' })
    emitProgressUpdate()
    return
  }

  upsertRecord(id, { status: 'downloading' })
  ensureBroadcaster()
}

function persistFromSession(session: TorrentSession): {
  progress: number
  downloaded: number
  totalSize: number
} {
  const t = session.getTorrent()
  if (t) {
    return {
      progress: safeNum(t.progress),
      downloaded: safeNum(t.downloaded),
      totalSize: safeNum(t.length)
    }
  }
  // Torrent already torn down — fall back to the pre-destroy snapshot.
  const snap = session.getLastSnapshot()
  return {
    progress: safeNum(snap?.progress),
    downloaded: safeNum(snap?.downloaded),
    totalSize: safeNum(snap?.totalSize)
  }
}

function ensureBroadcaster(): void {
  startProgressBroadcast(getDownloads, persistAllProgress)
}

function persistAllProgress(): void {
  for (const [id, session] of sessions) {
    const t = session.getTorrent()
    if (!t || t.destroyed || t.done) continue
    upsertRecord(id, persistFromSession(session))
  }
}
