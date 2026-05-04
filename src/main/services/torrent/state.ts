/**
 * Single source of truth for a torrent session's lifecycle.
 *
 * The persisted record's `status` field mirrors this state via a small
 * mapping table; callers and the UI must never read torrent flags
 * (paused/destroyed/done) directly to derive state.
 */

export type SessionState =
  | 'idle' // freshly constructed; no webtorrent.add() yet
  | 'metadata' // torrent.add() called, waiting for info-hash → metadata
  | 'downloading' // metadata in hand, transferring
  | 'paused' // user-paused; torrent kept alive (real torrent.pause())
  | 'queued' // returned to scheduler queue (no live torrent)
  | 'on-hold' // user-held; will not auto-start
  | 'completed' // 100 % verified; torrent torn down
  | 'error' // terminal error
  | 'disposed' // torn down, no longer tracked

export type SessionMode = 'download' | 'stream'

export interface StateTransition {
  from: SessionState
  to: SessionState
  reason?: string
}

const ALLOWED: Record<SessionState, ReadonlyArray<SessionState>> = {
  idle: ['metadata', 'queued', 'on-hold', 'error', 'disposed'],
  metadata: ['downloading', 'paused', 'queued', 'error', 'disposed'],
  downloading: ['paused', 'queued', 'completed', 'error', 'disposed'],
  paused: ['downloading', 'queued', 'on-hold', 'error', 'disposed'],
  queued: ['idle', 'on-hold', 'disposed'],
  'on-hold': ['queued', 'disposed'],
  completed: ['disposed'],
  error: ['queued', 'disposed'],
  disposed: []
}

export function canTransition(from: SessionState, to: SessionState): boolean {
  return ALLOWED[from].includes(to)
}

/** Map FSM state to the persisted record's status field (DownloadItem['status']). */
export function persistedStatus(
  state: SessionState
): 'downloading' | 'paused' | 'completed' | 'error' | 'queued' | 'on-hold' {
  switch (state) {
    case 'completed':
      return 'completed'
    case 'paused':
      return 'paused'
    case 'on-hold':
      return 'on-hold'
    case 'error':
      return 'error'
    case 'queued':
    case 'idle':
      return 'queued'
    case 'metadata':
    case 'downloading':
      return 'downloading'
    case 'disposed':
      return 'queued'
  }
}
