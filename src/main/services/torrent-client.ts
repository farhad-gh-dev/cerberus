import type WebTorrent from 'webtorrent'

let client: WebTorrent | null = null

export async function getClient(): Promise<WebTorrent> {
  if (!client) {
    const WTModule = (await import('webtorrent')).default
    client = new WTModule({
      dht: {
        bootstrap: [
          'router.bittorrent.com:6881',
          'router.utorrent.com:6881',
          'dht.transmissionbt.com:6881',
          'dht.aelitis.com:6881'
        ]
      },
      maxConns: 100
    })
  }
  return client
}

export function destroyClient(): void {
  if (client) {
    client.destroy()
    client = null
  }
}
