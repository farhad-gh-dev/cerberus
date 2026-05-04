declare module 'webtorrent' {
  class WebTorrent {
    constructor(opts?: {
      dht?: { bootstrap?: string[] } | boolean
      maxConns?: number
      [key: string]: unknown
    })
    add(
      torrentId: string,
      opts?: { path?: string; announce?: string[]; strategy?: string; [key: string]: unknown }
    ): WebTorrent.Torrent
    get(torrentId: string): WebTorrent.Torrent | null
    destroy(callback?: () => void): void
    on(event: string, callback: (...args: unknown[]) => void): void
    off(event: string, callback: (...args: unknown[]) => void): void
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
      pieceLength: number
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
      select?(start: number, end: number, priority?: number): void
      critical?(start: number, end: number): void
      destroy(opts?: object, callback?: () => void): void
      on(event: string, callback: (...args: unknown[]) => void): void
      once(event: string, callback: (...args: unknown[]) => void): void
      off(event: string, callback: (...args: unknown[]) => void): void
    }

    interface File {
      name: string
      path: string
      length: number
      done: boolean
      select?(): void
      deselect?(): void
      on(event: string, callback: (...args: unknown[]) => void): void
      once(event: string, callback: (...args: unknown[]) => void): void
      off(event: string, callback: (...args: unknown[]) => void): void
      createReadStream(opts?: { start?: number; end?: number }): import('stream').Readable
    }
  }

  export = WebTorrent
}
