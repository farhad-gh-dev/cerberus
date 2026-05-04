import { ANNOUNCE_TRACKERS } from '../../../config/trackers'
import { TorrentError } from '../errors'

/**
 * Sanitize a renderer-supplied magnet URI:
 *   - require xt=urn:btih:<hash>
 *   - drop tr= parameters supplied by the user
 *   - drop ws= web-seed parameters supplied by the user
 *   - reattach the curated tracker list (caller adds via `announce` opt)
 *
 * This blocks the privacy-leak vector where a malicious magnet pasted into
 * the "open magnet" form would announce to attacker-controlled trackers
 * and thereby leak the user's IP.
 *
 * NOTE: we re-emit the magnet by hand rather than via URLSearchParams,
 * because URLSearchParams.toString() percent-encodes the colons in
 * `xt=urn:btih:…` and `magnet-uri` (the parser inside webtorrent) does
 * NOT decode them — the resulting magnet would have no info-hash and
 * webtorrent would reject it as invalid.
 */

const DROPPED_KEYS = new Set(['tr', 'ws', 'as', 'xs'])

export function sanitizeMagnet(input: string): { magnet: string; infoHash: string } {
  const trimmed = input.trim()
  if (!trimmed.toLowerCase().startsWith('magnet:?')) {
    throw new TorrentError('invalid-magnet', 'Not a magnet URI')
  }

  const search = trimmed.slice('magnet:?'.length)
  const pairs = search.split('&').filter(Boolean)

  let infoHash: string | null = null
  const kept: string[] = []

  for (const pair of pairs) {
    const eq = pair.indexOf('=')
    if (eq < 0) continue
    const rawKey = pair.slice(0, eq)
    const rawVal = pair.slice(eq + 1)
    const key = decodeURIComponent(rawKey).toLowerCase()
    if (DROPPED_KEYS.has(key)) continue

    // We need the decoded xt value to extract the hash, but we want to
    // keep the original (already-properly-escaped) form on the wire.
    if (key === 'xt') {
      const decoded = decodeURIComponent(rawVal)
      const m = /^urn:btih:([A-Za-z0-9]+)$/.exec(decoded)
      if (m) {
        const candidate = m[1].toLowerCase()
        if (/^[a-f0-9]{40}$/.test(candidate) || /^[a-z2-7]{32}$/.test(candidate)) {
          infoHash = candidate
        }
      }
    }

    kept.push(`${rawKey}=${rawVal}`)
  }

  if (!infoHash) {
    throw new TorrentError('invalid-magnet', 'Magnet missing valid xt=urn:btih: parameter')
  }

  return {
    magnet: `magnet:?${kept.join('&')}`,
    infoHash
  }
}

export function curatedTrackers(): readonly string[] {
  return ANNOUNCE_TRACKERS
}
