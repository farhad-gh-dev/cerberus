import type WebTorrent from 'webtorrent'

/**
 * Minimum number of peers before we consider the swarm "healthy" and can
 * slow down re-announce attempts. Below this threshold we keep aggressively
 * re-announcing to find more peers faster.
 */
const MIN_HEALTHY_PEERS = 10

/**
 * Aggressive re-announce schedule (in ms).
 * Starts very fast then backs off. Each entry fires once in sequence.
 */
const REANNOUNCE_SCHEDULE_MS = [
  1_500, // attempt 1 —  1.5 s
  2_000, // attempt 2 —  3.5 s
  3_000, // attempt 3 —  6.5 s
  3_000, // attempt 4 —  9.5 s
  5_000, // attempt 5 — 14.5 s
  5_000, // attempt 6 — 19.5 s
  5_000, // attempt 7 — 24.5 s
  10_000, // attempt 8 — 34.5 s
  10_000, // attempt 9 — 44.5 s
  10_000, // attempt 10 — 54.5 s
  15_000, // attempt 11 — 69.5 s
  15_000 // attempt 12 — 84.5 s
]

/**
 * After the initial burst, keep re-announcing every SUSTAIN_INTERVAL_MS
 * as long as we're below MIN_HEALTHY_PEERS, up to MAX_SUSTAIN_ATTEMPTS times.
 */
const SUSTAIN_INTERVAL_MS = 30_000
const MAX_SUSTAIN_ATTEMPTS = 10

/** Force tracker re-announce on a torrent. */
export function reannounce(torrent: WebTorrent.Torrent): void {
  if (typeof torrent.announce === 'function') {
    torrent.announce()
  }
  if (typeof torrent.discovery?.tracker?.update === 'function') {
    torrent.discovery.tracker.update()
  }
}

/** Schedule the next re-announce attempt with back-off. */
function scheduleReannounce(id: string, torrent: WebTorrent.Torrent, attempt: number): void {
  if (attempt >= REANNOUNCE_SCHEDULE_MS.length) {
    // Initial burst finished — switch to sustained re-announce
    startSustainedReannounce(id, torrent, 0)
    return
  }

  const delay = REANNOUNCE_SCHEDULE_MS[attempt]

  setTimeout(() => {
    if (!torrent || torrent.done || torrent.destroyed) return

    // Only skip if we already have plenty of peers
    if (torrent.numPeers >= MIN_HEALTHY_PEERS) {
      console.log(
        `[reannounce] ${torrent.numPeers} peers for ${id} (≥${MIN_HEALTHY_PEERS}), pausing burst re-announce`
      )
      // Still start sustained loop in case peers drop later
      startSustainedReannounce(id, torrent, 0)
      return
    }

    console.log(
      `[reannounce] Re-announcing for ${id} (burst ${attempt + 1}/${REANNOUNCE_SCHEDULE_MS.length}, peers: ${torrent.numPeers})`
    )
    try {
      reannounce(torrent)
    } catch (err) {
      console.error('[reannounce] Re-announce error:', err)
    }

    scheduleReannounce(id, torrent, attempt + 1)
  }, delay)
}

/**
 * Longer-interval re-announce that runs after the initial burst.
 * Keeps the peer count healthy for the lifetime of the download.
 */
function startSustainedReannounce(id: string, torrent: WebTorrent.Torrent, attempt: number): void {
  if (attempt >= MAX_SUSTAIN_ATTEMPTS) return

  setTimeout(() => {
    if (!torrent || torrent.done || torrent.destroyed) return

    // Still re-announce periodically even with some peers — peers churn
    if (torrent.numPeers < MIN_HEALTHY_PEERS) {
      console.log(
        `[reannounce] Sustained re-announce for ${id} (attempt ${attempt + 1}/${MAX_SUSTAIN_ATTEMPTS}, peers: ${torrent.numPeers})`
      )
      try {
        reannounce(torrent)
      } catch (err) {
        console.error('[reannounce] Sustained re-announce error:', err)
      }
    }

    startSustainedReannounce(id, torrent, attempt + 1)
  }, SUSTAIN_INTERVAL_MS)
}

/**
 * Kick-start peer discovery for a torrent:
 * 1. Immediate re-announce right now
 * 2. Re-announce again when metadata arrives (important — new info-hash is known)
 * 3. Re-announce when WebTorrent reports no peers for a discovery method
 * 4. Scheduled re-announces with aggressive-then-backoff timing
 */
export function startReannounceLoop(id: string, torrent: WebTorrent.Torrent): void {
  // Immediate first announce
  try {
    reannounce(torrent)
    console.log(`[reannounce] Immediate re-announce for ${id}`)
  } catch (err) {
    console.error('[reannounce] Immediate re-announce error:', err)
  }

  // Re-announce as soon as metadata is available (info-hash resolved).
  // Always re-announce here regardless of current peer count — metadata
  // arrival means the real info-hash is now known and trackers may return
  // a completely different (larger) peer list.
  torrent.once('ready', () => {
    if (!torrent.done && !torrent.destroyed) {
      console.log(
        `[reannounce] Metadata ready — re-announcing for ${id} (peers: ${torrent.numPeers})`
      )
      try {
        reannounce(torrent)
      } catch (err) {
        console.error('[reannounce] Metadata re-announce error:', err)
      }
    }
  })

  // React to WebTorrent's "noPeers" event — emitted when a specific
  // discovery method (tracker / DHT) yields zero peers.
  torrent.on('noPeers', ((announceType: string) => {
    if (torrent.done || torrent.destroyed) return
    console.log(`[reannounce] noPeers (${announceType}) for ${id} — forcing re-announce`)
    try {
      reannounce(torrent)
    } catch {
      // ignore
    }
  }) as (...args: unknown[]) => void)

  // Start the scheduled back-off loop
  scheduleReannounce(id, torrent, 0)
}
