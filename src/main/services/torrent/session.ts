import { join } from 'path'
import type WebTorrent from 'webtorrent'
import { getPool } from './pool'
import { sanitizeMagnet, curatedTrackers } from './policies/magnet'
import { deselectExtras } from './policies/file'
import { attachAnnounceCoordinator, type AnnounceCoordinator } from './announce-coordinator'
import { ensureFreeSpace } from './disk-guard'
import { canTransition, type SessionState } from './state'
import { classify, isTransient, TorrentError } from './errors'
import { getSetting } from '../settings'

/**
 * One TorrentSession owns one webtorrent.Torrent over its full lifetime,
 * runs the FSM, owns the announce coordinator, the metadata timeout, the
 * stall watchdog, and the retry loop. It exposes a small set of methods
 * to the engine and emits state-change callbacks.
 */

const METADATA_TIMEOUT_MS = 45_000
const METADATA_RETRY_DELAYS_MS = [45_000, 90_000, 180_000]

const STALL_WINDOW_MS = 60_000
const STALL_BYTES = 32 * 1024
const STALL_DEMOTE_MS = 90_000

export interface SessionEvents {
  onStateChange?: (state: SessionState, detail?: { error?: TorrentError }) => void
  onComplete?: () => void
  onMetadata?: () => void
}

export interface SessionInit {
  id: string
  magnet: string
  savePath: string
  /** Caller-controlled hook to demote into the queue (frees a slot). */
  onDemote?: () => void
}

export class TorrentSession {
  readonly id: string
  readonly savePath: string
  private readonly events: SessionEvents
  private readonly onDemote?: () => void

  private state: SessionState = 'idle'
  private rawMagnet: string
  private sanitizedMagnet: string
  private infoHash: string

  private torrentRef: WebTorrent.Torrent | null = null
  private announce: AnnounceCoordinator | null = null
  // Captured at teardown so callers can read final numbers after destroy().
  private lastSnapshot: {
    progress: number
    downloaded: number
    totalSize: number
    rootPath?: string
  } | null = null

  private metadataTimer: ReturnType<typeof setTimeout> | null = null
  private metadataAttempt = 0

  private stallProbeTimer: ReturnType<typeof setInterval> | null = null
  private stallLastBytes = 0
  private stallLowSince: number | null = null

  constructor(init: SessionInit, events: SessionEvents = {}) {
    this.id = init.id
    this.savePath = init.savePath
    this.rawMagnet = init.magnet
    this.events = events
    this.onDemote = init.onDemote
    const { magnet, infoHash } = sanitizeMagnet(init.magnet)
    this.sanitizedMagnet = magnet
    this.infoHash = infoHash
  }

  // ────────── observable state ──────────

  getState(): SessionState {
    return this.state
  }

  getTorrent(): WebTorrent.Torrent | null {
    return this.torrentRef
  }

  /** Last-known progress/downloaded/totalSize/rootPath, captured at teardown. */
  getLastSnapshot(): {
    progress: number
    downloaded: number
    totalSize: number
    rootPath?: string
  } | null {
    return this.lastSnapshot
  }

  getInfoHash(): string {
    return this.infoHash
  }

  getRawMagnet(): string {
    return this.rawMagnet
  }

  // ────────── lifecycle ──────────

  /** Add the torrent to the download pool and wire up event handlers. */
  async start(): Promise<void> {
    if (!this.transition('metadata')) return

    const client = await getPool('download')

    const t = client.add(this.sanitizedMagnet, {
      path: this.savePath,
      announce: [...curatedTrackers()],
      strategy: 'rarest'
    } as Record<string, unknown>)

    this.torrentRef = t
    this.announce = attachAnnounceCoordinator(this.id, t)

    t.on('error', this.handleError)
    t.on('ready', this.handleMetadataReady)
    t.on('done', this.handleDone)
    t.on('close', this.handleClose)

    this.armMetadataTimeout()
  }

  /** Real pause: keeps wires + bitfield, stops requesting blocks. */
  pause(): boolean {
    if (!this.torrentRef || this.torrentRef.destroyed) return false
    if (this.state !== 'downloading' && this.state !== 'metadata') return false

    try {
      this.torrentRef.pause()
    } catch {
      // ignore
    }
    return this.transition('paused')
  }

  resume(): boolean {
    if (!this.torrentRef || this.torrentRef.destroyed) return false
    if (this.state !== 'paused') return false

    try {
      this.torrentRef.resume()
    } catch {
      // ignore
    }
    this.announce?.poke()
    return this.transition('downloading')
  }

  /** Demote: tear down completely so the slot frees up. */
  demote(): void {
    this.tearDownTorrent()
    this.transition('queued', 'demoted')
  }

  hold(): void {
    this.tearDownTorrent()
    this.transition('on-hold', 'held')
  }

  /** Final teardown — record marked terminal by caller. */
  dispose(deleteFiles = false): void {
    this.tearDownTorrent(deleteFiles)
    this.transition('disposed', 'disposed')
  }

  // ────────── handlers ──────────

  private handleError = (raw: unknown): void => {
    const err = classify(raw)

    if (err.kind === 'enobufs' || err.kind === 'utp-bind') {
      // Benign socket-layer hiccup; webtorrent will recover.
      return
    }

    if (isTransient(err.kind)) {
      console.warn(`[session/${this.id}] transient error (${err.kind}):`, err.message)
      this.announce?.poke()
      return
    }

    console.error(`[session/${this.id}] fatal error (${err.kind}):`, err.message)
    this.tearDownTorrent()
    this.transition('error', `error:${err.kind}`)
    this.events.onStateChange?.('error', { error: err })
  }

  private handleMetadataReady = async (): Promise<void> => {
    this.clearMetadataTimer()
    if (!this.torrentRef) return

    // Disk-space check now that we know the real length.
    try {
      await ensureFreeSpace(this.savePath, this.torrentRef.length)
    } catch (err) {
      const e = err instanceof TorrentError ? err : classify(err)
      this.tearDownTorrent()
      this.transition('error', `error:${e.kind}`)
      this.events.onStateChange?.('error', { error: e })
      return
    }

    // Decide which files we're actually downloading. webtorrent's own
    // 'done' event requires *every* file's pieces to be in the bitfield,
    // so once we deselect extras we cannot rely on it — we track the
    // SELECTED files' per-file 'done' events instead.
    let selectedFiles: WebTorrent.File[]
    if (getSetting('keepExtras') !== true) {
      const result = deselectExtras(this.torrentRef)
      selectedFiles = result.selected
      if (result.deselectedCount > 0) {
        console.log(`[session/${this.id}] deselected ${result.deselectedCount} extra file(s)`)
      }
    } else {
      // keepExtras = true → every file is selected by webtorrent default
      selectedFiles = this.torrentRef.files
    }

    this.armFileCompletion(selectedFiles)

    this.events.onMetadata?.()
    this.transition('downloading')
    this.startStallProbe()
  }

  /**
   * Watch each selected file's 'done' event and fire handleDone() once
   * every selected file has completed. Replaces relying on the torrent's
   * own 'done' event, which never fires when any file is deselected.
   */
  private armFileCompletion(selected: WebTorrent.File[]): void {
    if (selected.length === 0) return

    let remaining = 0
    for (const f of selected) {
      if (f.done) continue
      remaining++
      f.once('done', () => {
        if (this.state === 'disposed' || this.state === 'completed') return
        remaining--
        if (remaining <= 0) this.handleDone()
      })
    }

    // All selected files were already done at metadata-arrival time
    // (re-hydration of a finished torrent) — fire immediately.
    if (remaining === 0) {
      queueMicrotask(() => {
        if (this.state !== 'disposed' && this.state !== 'completed') this.handleDone()
      })
    }
  }

  private handleDone = (): void => {
    this.stopStallProbe()
    this.transition('completed')
    this.events.onComplete?.()
    this.tearDownTorrent()
  }

  private handleClose = (): void => {
    this.announce?.dispose()
    this.announce = null
  }

  // ────────── metadata timeout ──────────

  private armMetadataTimeout(): void {
    this.clearMetadataTimer()
    this.metadataTimer = setTimeout(() => {
      this.metadataTimer = null
      if (this.state !== 'metadata') return
      console.warn(`[session/${this.id}] metadata timed out (attempt ${this.metadataAttempt + 1})`)
      this.metadataAttempt++

      if (this.metadataAttempt >= METADATA_RETRY_DELAYS_MS.length) {
        const err = new TorrentError('metadata-timeout', 'No metadata received')
        this.tearDownTorrent()
        this.transition('error', 'metadata-timeout')
        this.events.onStateChange?.('error', { error: err })
        return
      }

      this.announce?.poke()
      this.metadataTimer = setTimeout(() => {
        this.metadataTimer = null
        if (this.state === 'metadata') this.armMetadataTimeout()
      }, METADATA_RETRY_DELAYS_MS[this.metadataAttempt])
    }, METADATA_TIMEOUT_MS)
  }

  private clearMetadataTimer(): void {
    if (this.metadataTimer) {
      clearTimeout(this.metadataTimer)
      this.metadataTimer = null
    }
  }

  // ────────── stall watchdog ──────────

  private startStallProbe(): void {
    if (this.stallProbeTimer) return
    this.stallLastBytes = this.torrentRef?.downloaded ?? 0
    this.stallLowSince = null
    this.stallProbeTimer = setInterval(() => this.probeStall(), STALL_WINDOW_MS)
  }

  private stopStallProbe(): void {
    if (this.stallProbeTimer) clearInterval(this.stallProbeTimer)
    this.stallProbeTimer = null
    this.stallLowSince = null
  }

  private probeStall(): void {
    const t = this.torrentRef
    if (!t || t.destroyed || t.done) {
      this.stopStallProbe()
      return
    }
    if (this.state !== 'downloading') return

    const now = Date.now()
    const bytes = t.downloaded
    const delta = bytes - this.stallLastBytes
    this.stallLastBytes = bytes

    const stalled = delta < STALL_BYTES && t.numPeers < 3
    if (!stalled) {
      this.stallLowSince = null
      return
    }

    if (this.stallLowSince === null) {
      this.stallLowSince = now
      console.warn(`[session/${this.id}] stall detected; poking trackers`)
      this.announce?.poke()
      return
    }

    if (now - this.stallLowSince >= STALL_DEMOTE_MS) {
      console.warn(`[session/${this.id}] sustained stall — demoting to queue`)
      this.stopStallProbe()
      this.demote()
      this.onDemote?.()
    }
  }

  // ────────── teardown ──────────

  private tearDownTorrent(deleteFiles = false): void {
    this.clearMetadataTimer()
    this.stopStallProbe()

    if (this.announce) {
      this.announce.dispose()
      this.announce = null
    }

    const t = this.torrentRef
    if (t) {
      const torrentPath = (t as unknown as { path?: string }).path
      const rootPath =
        t.name && torrentPath ? join(torrentPath, t.name) : torrentPath || this.savePath
      this.lastSnapshot = {
        progress: Number.isFinite(t.progress) ? t.progress : 0,
        downloaded: Number.isFinite(t.downloaded) ? t.downloaded : 0,
        totalSize: Number.isFinite(t.length) ? t.length : 0,
        rootPath
      }
    }
    this.torrentRef = null
    if (t && !t.destroyed) {
      try {
        t.destroy({ destroyStore: deleteFiles })
      } catch {
        // ignore
      }
    }
  }

  // ────────── FSM ──────────

  private transition(to: SessionState, reason?: string): boolean {
    if (this.state === to) return true
    if (!canTransition(this.state, to)) {
      console.warn(`[session/${this.id}] illegal transition ${this.state} → ${to} (${reason})`)
      return false
    }
    this.state = to
    this.events.onStateChange?.(to)
    return true
  }
}
