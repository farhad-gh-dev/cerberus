import type WebTorrent from 'webtorrent'

/**
 * Single, debounced announce trigger per torrent. Replaces the four
 * uncoordinated paths (timer schedule + 'ready' + 'noPeers' + wire-count
 * thresholds) that could fire the same announce three times in a second.
 *
 * The bootstrap phase fires bursts as soon as triggers come in; once the
 * swarm reaches HEALTHY_PEERS we drop to a sustained 30 s pulse only when
 * peer count falls below LOW_PEERS.
 */

const HEALTHY_PEERS = 10
const LOW_PEERS = 5
const BOOTSTRAP_BURST_MS = [1500, 2000, 3000, 5000, 8000, 13000, 21000]
const SUSTAINED_INTERVAL_MS = 30_000
const MIN_INTERVAL_MS = 2000 // never fire two announces within 2 s

interface CoordinatorState {
  torrent: WebTorrent.Torrent
  burstIndex: number
  lastFired: number
  pendingTimer: ReturnType<typeof setTimeout> | null
  sustainedTimer: ReturnType<typeof setInterval> | null
  disposed: boolean
  log: (msg: string) => void
}

function fire(state: CoordinatorState): void {
  if (state.disposed) return
  const t = state.torrent
  if (t.destroyed || t.done) return

  const now = Date.now()
  if (now - state.lastFired < MIN_INTERVAL_MS) return

  state.lastFired = now
  try {
    t.announce?.()
  } catch (err) {
    state.log(`announce() threw: ${(err as Error).message}`)
  }
  try {
    t.discovery?.tracker?.update?.()
  } catch {
    // ignore
  }
}

function scheduleBurst(state: CoordinatorState): void {
  if (state.disposed || state.pendingTimer) return
  if (state.burstIndex >= BOOTSTRAP_BURST_MS.length) {
    enterSustained(state)
    return
  }

  const delay = BOOTSTRAP_BURST_MS[state.burstIndex]
  state.pendingTimer = setTimeout(() => {
    state.pendingTimer = null
    if (state.disposed) return

    if (state.torrent.numPeers >= HEALTHY_PEERS) {
      enterSustained(state)
      return
    }

    fire(state)
    state.burstIndex++
    scheduleBurst(state)
  }, delay)
}

function enterSustained(state: CoordinatorState): void {
  if (state.disposed || state.sustainedTimer) return
  state.sustainedTimer = setInterval(() => {
    if (state.disposed) return
    if (state.torrent.numPeers < LOW_PEERS) {
      fire(state)
    }
  }, SUSTAINED_INTERVAL_MS)
}

export interface AnnounceCoordinator {
  /** Trigger an announce attempt now (debounced + rate-limited). */
  poke(): void
  /** Tear down all timers; must be called when the torrent is destroyed. */
  dispose(): void
}

export function attachAnnounceCoordinator(
  id: string,
  torrent: WebTorrent.Torrent
): AnnounceCoordinator {
  const state: CoordinatorState = {
    torrent,
    burstIndex: 0,
    lastFired: 0,
    pendingTimer: null,
    sustainedTimer: null,
    disposed: false,
    log: (msg) => console.log(`[announce/${id}] ${msg}`)
  }

  // Immediate first announce, then schedule the burst.
  fire(state)
  scheduleBurst(state)

  // 'ready' = info-hash known, trackers may now return a real peer list.
  torrent.once('ready', () => {
    if (state.disposed) return
    state.log('metadata ready — re-announcing')
    fire(state)
  })

  // First wire opens — PEX may flood new peers; one extra announce helps.
  let firstWireSeen = false
  torrent.on('wire', (() => {
    if (firstWireSeen || state.disposed) return
    firstWireSeen = true
    fire(state)
  }) as (...args: unknown[]) => void)

  // webtorrent emits noPeers per discovery method; coalesce into a poke.
  torrent.on('noPeers', (() => {
    if (state.disposed) return
    fire(state)
  }) as (...args: unknown[]) => void)

  return {
    poke(): void {
      fire(state)
    },
    dispose(): void {
      state.disposed = true
      if (state.pendingTimer) clearTimeout(state.pendingTimer)
      if (state.sustainedTimer) clearInterval(state.sustainedTimer)
      state.pendingTimer = null
      state.sustainedTimer = null
    }
  }
}
