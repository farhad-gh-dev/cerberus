import type WebTorrent from 'webtorrent'
import { getSetting } from '../settings'
import { classify, isBenign } from './errors'

/**
 * Two long-lived WebTorrent clients with disjoint connection pools.
 * Isolation eliminates the data-loss path where stopping a stream session
 * could destroy a download session that happened to share an info-hash.
 */

type PoolKind = 'download' | 'stream'

interface Pool {
  client: WebTorrent | null
  pending: Promise<WebTorrent> | null
}

const pools: Record<PoolKind, Pool> = {
  download: { client: null, pending: null },
  stream: { client: null, pending: null }
}

const DHT_BOOTSTRAP = [
  'router.bittorrent.com:6881',
  'router.utorrent.com:6881',
  'dht.transmissionbt.com:6881',
  'dht.aelitis.com:6881'
]

const MAX_CONNS: Record<PoolKind, number> = {
  download: 80,
  stream: 80
}

async function createClient(kind: PoolKind): Promise<WebTorrent> {
  const WTModule = (await import('webtorrent')).default
  const utp = getSetting('utpEnabled') === true

  const client = new WTModule({
    dht: { bootstrap: DHT_BOOTSTRAP },
    maxConns: MAX_CONNS[kind],
    utp,
    downloadLimit: -1,
    uploadLimit: -1
  } as Record<string, unknown>)

  client.on('error', (err: unknown) => {
    const e = classify(err)
    if (isBenign(e.kind)) {
      // Already handled, swallow.
      return
    }
    console.warn(`[torrent-pool/${kind}] client error:`, e.kind, e.message)
  })

  return client
}

export async function getPool(kind: PoolKind): Promise<WebTorrent> {
  const slot = pools[kind]
  if (slot.client) return slot.client
  if (slot.pending) return slot.pending

  slot.pending = createClient(kind).then((c) => {
    slot.client = c
    slot.pending = null
    return c
  })
  return slot.pending
}

export function destroyPools(): void {
  for (const kind of Object.keys(pools) as PoolKind[]) {
    const slot = pools[kind]
    if (slot.client) {
      try {
        slot.client.destroy()
      } catch {
        // ignore
      }
      slot.client = null
    }
    slot.pending = null
  }
}

export function downloadPoolSync(): WebTorrent | null {
  return pools.download.client
}

export function streamPoolSync(): WebTorrent | null {
  return pools.stream.client
}
