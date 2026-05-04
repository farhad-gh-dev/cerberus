import type WebTorrent from 'webtorrent'
import type { PeerInfo } from '../../shared/types'
import { geolocateBatch } from './geolocation'
import { safeNum } from './download-helpers'

export async function getPeers(
  torrent: WebTorrent.Torrent | null,
  pieceCount: number
): Promise<PeerInfo[]> {
  if (!torrent) return []

  const wires = torrent.wires || []
  if (wires.length === 0) return []

  // One deduped batched lookup, instead of one Promise per wire per poll.
  const addresses = wires.map((w) => w.remoteAddress || '')
  const uniqueAddrs = Array.from(new Set(addresses.filter(Boolean)))
  const locations = uniqueAddrs.length > 0 ? await geolocateBatch(uniqueAddrs) : null

  return wires.map((wire, i) => {
    const address = addresses[i]
    const port = wire.remotePort || 0
    const location = address && locations ? (locations.get(address) ?? null) : null

    return {
      id: `${address}:${port}-${i}`,
      address,
      port,
      client: wire.peerExtendedHandshake?.v?.toString() || wire.type || 'Unknown',
      downloadSpeed: typeof wire.downloadSpeed === 'function' ? wire.downloadSpeed() : 0,
      uploadSpeed: typeof wire.uploadSpeed === 'function' ? wire.uploadSpeed() : 0,
      downloaded: safeNum(wire.downloaded),
      uploaded: safeNum(wire.uploaded),
      progress: safeNum(
        wire.peerPieces?.buffer
          ? wire.peerPieces.buffer.reduce((a: number, b: number) => a + popCount(b), 0) /
              Math.max(1, pieceCount)
          : 0
      ),
      location: location || undefined
    } satisfies PeerInfo
  })
}

/** Count the number of set bits in a byte. */
function popCount(n: number): number {
  let count = 0
  let v = n & 0xff
  while (v) {
    count += v & 1
    v >>= 1
  }
  return count
}
