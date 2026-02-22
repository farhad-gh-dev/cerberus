import type WebTorrent from 'webtorrent'

/**
 * Aggressive re-announce schedule (in ms).
 * Starts fast (2s, 3s, 5s) then backs off gradually.
 */
const REANNOUNCE_SCHEDULE_MS = [
  2_000, // attempt 1 — 2 s after start
  3_000, // attempt 2 — 5 s total
  5_000, // attempt 3 — 10 s total
  5_000, // attempt 4 — 15 s total
  10_000, // attempt 5 — 25 s total
  10_000, // attempt 6 — 35 s total
  15_000, // attempt 7 — 50 s total
  15_000, // attempt 8 — 65 s total
  20_000, // attempt 9 — 85 s total
  20_000 // attempt 10 — 105 s total
]

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
    console.warn(
      `[download-manager] Gave up re-announcing for ${id} after ${REANNOUNCE_SCHEDULE_MS.length} attempts`
    )
    return
  }

  const delay = REANNOUNCE_SCHEDULE_MS[attempt]

  setTimeout(() => {
    if (!torrent || torrent.done || torrent.destroyed || torrent.numPeers > 0) {
      if (torrent?.numPeers > 0) {
        console.log(
          `[download-manager] Found ${torrent.numPeers} peer(s) for ${id}, stopping re-announce`
        )
      }
      return
    }

    console.log(
      `[download-manager] Re-announcing for ${id} (attempt ${attempt + 1}/${REANNOUNCE_SCHEDULE_MS.length})`
    )
    try {
      reannounce(torrent)
    } catch (err) {
      console.error('[download-manager] Re-announce error:', err)
    }

    scheduleReannounce(id, torrent, attempt + 1)
  }, delay)
}

/**
 * Kick-start peer discovery for a torrent:
 * 1. Immediate re-announce right now
 * 2. Re-announce again when metadata arrives (important — new info-hash is known)
 * 3. Scheduled re-announces with aggressive-then-backoff timing
 */
export function startReannounceLoop(id: string, torrent: WebTorrent.Torrent): void {
  // Immediate first announce
  try {
    reannounce(torrent)
    console.log(`[download-manager] Immediate re-announce for ${id}`)
  } catch (err) {
    console.error('[download-manager] Immediate re-announce error:', err)
  }

  // Re-announce as soon as metadata is available (info-hash resolved)
  torrent.once('ready', () => {
    if (!torrent.done && !torrent.destroyed && torrent.numPeers === 0) {
      console.log(`[download-manager] Metadata ready — re-announcing for ${id}`)
      try {
        reannounce(torrent)
      } catch (err) {
        console.error('[download-manager] Metadata re-announce error:', err)
      }
    }
  })

  // Start the scheduled back-off loop
  scheduleReannounce(id, torrent, 0)
}
