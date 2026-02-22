import type WebTorrent from 'webtorrent'
import type { PeerInfo } from '../../shared/types'
import { geolocateIp } from './geolocation'
import { safeNum } from './download-helpers'

export async function getPeers(
  torrent: WebTorrent.Torrent | null,
  pieceCount: number
): Promise<PeerInfo[]> {
  if (!torrent) return []

  const wires = torrent.wires || []

  const geoPromises = wires.map(async (wire, i) => {
    const address = wire.remoteAddress || ''
    const port = wire.remotePort || 0
    const location = address ? await geolocateIp(address) : null

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

  return Promise.all(geoPromises)
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
