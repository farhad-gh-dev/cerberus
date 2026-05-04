/**
 * Typed errors and a classifier that decides whether an error is transient
 * (retry) or fatal (terminal). The session FSM consults the classifier on
 * every error event; only fatal errors push the session into 'error' state.
 */

export type ErrorKind =
  | 'metadata-timeout'
  | 'insufficient-space'
  | 'invalid-magnet'
  | 'store-error'
  | 'network-transient'
  | 'tracker-transient'
  | 'utp-bind' // benign — uTP socket bind hiccup
  | 'enobufs' // benign — out of socket buffers (Windows)
  | 'unknown'

export class TorrentError extends Error {
  readonly kind: ErrorKind
  readonly cause?: unknown
  constructor(kind: ErrorKind, message: string, cause?: unknown) {
    super(message)
    this.name = 'TorrentError'
    this.kind = kind
    this.cause = cause
  }
}

const TRANSIENT: ReadonlySet<ErrorKind> = new Set([
  'network-transient',
  'tracker-transient',
  'utp-bind',
  'enobufs'
])

const BENIGN: ReadonlySet<ErrorKind> = new Set(['utp-bind', 'enobufs'])

export function isTransient(kind: ErrorKind): boolean {
  return TRANSIENT.has(kind)
}

export function isBenign(kind: ErrorKind): boolean {
  return BENIGN.has(kind)
}

/**
 * Classify an arbitrary error from webtorrent / Node networking. We pattern
 * on `code` first, then string-match the message as a last resort. This
 * replaces the global uncaughtException string-matcher in main/index.ts.
 */
export function classify(err: unknown): TorrentError {
  if (err instanceof TorrentError) return err

  const code = (err as { code?: string })?.code
  const msg = err instanceof Error ? err.message : String(err)

  if (code === 'ENOBUFS' || /no buffer space available/i.test(msg)) {
    return new TorrentError('enobufs', msg, err)
  }
  if (code === 'EADDRINUSE' || code === 'EAFNOSUPPORT' || /UTP\.(bind|connect)/i.test(msg)) {
    return new TorrentError('utp-bind', msg, err)
  }
  if (code === 'ENOSPC') {
    return new TorrentError('insufficient-space', msg, err)
  }
  if (code === 'ENETUNREACH' || code === 'EHOSTUNREACH' || code === 'ETIMEDOUT') {
    return new TorrentError('network-transient', msg, err)
  }
  if (/tracker/i.test(msg) && /(timeout|429|503|reset)/i.test(msg)) {
    return new TorrentError('tracker-transient', msg, err)
  }
  if (/invalid magnet|info[-_ ]?hash|infoHash/i.test(msg)) {
    return new TorrentError('invalid-magnet', msg, err)
  }
  return new TorrentError('unknown', msg, err)
}
