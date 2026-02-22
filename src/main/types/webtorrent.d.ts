declare module 'webtorrent' {
  class WebTorrent {
    constructor(opts?: {
      dht?: { bootstrap?: string[] } | boolean
      maxConns?: number
      [key: string]: unknown
    })
    add(torrentId: string, opts?: { path?: string; announce?: string[] }): WebTorrent.Torrent
    get(torrentId: string): WebTorrent.Torrent | null
    destroy(callback?: () => void): void
  }

  namespace WebTorrent {
    interface Wire {
      remoteAddress: string
      remotePort: number
      type: string
      downloaded: number
      uploaded: number
      downloadSpeed: number | (() => number)
      uploadSpeed: number | (() => number)
      peerExtendedHandshake?: { v?: Buffer | string }
      peerPieces?: { buffer: Uint8Array }
      destroy(): void
    }

    interface Piece {
      length: number
    }

    interface Torrent {
      infoHash: string
      magnetURI: string
      name: string
      path: string
      progress: number
      downloaded: number
      uploaded: number
      length: number
      downloadSpeed: number
      uploadSpeed: number
      timeRemaining: number
      numPeers: number
      done: boolean
      paused: boolean
      destroyed: boolean
      files: File[]
      wires: Wire[]
      pieces: Piece[]
      discovery?: {
        tracker?: {
          update(): void
        }
      }
      pause(): void
      resume(): void
      announce?(): void
      destroy(opts?: object, callback?: () => void): void
      on(event: string, callback: (...args: unknown[]) => void): void
      once(event: string, callback: (...args: unknown[]) => void): void
    }

    interface File {
      name: string
      path: string
      length: number
      select?(): void
      deselect?(): void
    }
  }

  export = WebTorrent
}
