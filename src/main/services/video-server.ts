import { createServer, type Server, type ServerResponse } from 'http'
import { createReadStream, statSync } from 'fs'
import { extname } from 'path'
import type { Readable } from 'stream'
import { convertSrtToVtt } from './subtitle-converter'
import { getStreamingSession, touchSession, seekStream } from './torrent/stream-engine'

// Only re-prioritize pieces when the jump exceeds this — smaller deltas are
// normal sequential reads / metadata probes and would just thrash priorities.
const SEEK_THRESHOLD_BYTES = 4 * 1024 * 1024
const lastRangeStartBySession = new Map<string, number>()

// Tear down both halves on stream error: a silent stall after a promised
// Content-Length hangs external players; a destroyed socket is a recoverable read error.
function pipeWithErrorHandling(stream: Readable, res: ServerResponse): void {
  let cleaned = false
  const cleanup = (): void => {
    if (cleaned) return
    cleaned = true
    try {
      stream.unpipe?.(res)
    } catch {
      // ignore: cleanup is best-effort
    }
    try {
      stream.destroy()
    } catch {
      // ignore: cleanup is best-effort
    }
  }

  stream.on('error', () => {
    cleanup()
    try {
      res.destroy()
    } catch {
      // ignore: cleanup is best-effort
    }
  })
  res.on('close', cleanup)
  res.on('error', cleanup)
  stream.pipe(res)
}

let server: Server | null = null
let port = 0

const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.m4v': 'video/x-m4v',
  '.wmv': 'video/x-ms-wmv',
  '.vtt': 'text/vtt',
  '.srt': 'text/vtt'
}

export function startVideoServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    server = createServer((req, res) => {
      try {
        const url = new URL(req.url || '/', `http://localhost`)
        const filePath = url.searchParams.get('path')

        // ── Streaming route: serve video data from a live WebTorrent file ──
        // Trailing `/<filename>` is a title hint for external players.
        if (url.pathname === '/stream' || url.pathname.startsWith('/stream/')) {
          const sessionId = url.searchParams.get('id')
          if (!sessionId) {
            res.writeHead(400)
            res.end('Missing session ID')
            return
          }

          const session = getStreamingSession(sessionId)
          if (!session) {
            res.writeHead(404)
            res.end('Streaming session not found')
            return
          }

          touchSession(sessionId)

          const file = session.file
          const fileSize = file.length
          const ext = extname(file.name).toLowerCase()
          const contentType = MIME_TYPES[ext] || 'application/octet-stream'
          const range = req.headers.range

          if (range) {
            const parts = range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
            const chunkSize = end - start + 1

            // External players don't call stream:seek IPC; re-prioritize pieces
            // server-side. In-app player invokes seekStream directly, so skip it.
            if (session.external && start > 0) {
              const last = lastRangeStartBySession.get(sessionId) ?? -Infinity
              if (Math.abs(start - last) >= SEEK_THRESHOLD_BYTES) {
                seekStream(sessionId, start)
                lastRangeStartBySession.set(sessionId, start)
              }
            }

            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunkSize,
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*'
            })

            const stream = file.createReadStream({ start, end })
            pipeWithErrorHandling(stream, res)
          } else {
            res.writeHead(200, {
              'Content-Length': fileSize,
              'Accept-Ranges': 'bytes',
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*'
            })

            const stream = file.createReadStream()
            pipeWithErrorHandling(stream, res)
          }
          return
        }

        if (!filePath) {
          res.writeHead(400)
          res.end('Missing path parameter')
          return
        }

        // Subtitle route: convert SRT to VTT on-the-fly
        if (url.pathname === '/subtitle') {
          const ext = extname(filePath).toLowerCase()
          if (ext === '.srt') {
            const vttContent = convertSrtToVtt(filePath)
            const buf = Buffer.from(vttContent, 'utf-8')
            res.writeHead(200, {
              'Content-Type': 'text/vtt; charset=utf-8',
              'Content-Length': buf.length,
              'Access-Control-Allow-Origin': '*'
            })
            res.end(buf)
          } else {
            // Serve .vtt (or other subtitle files) directly
            const stat = statSync(filePath)
            res.writeHead(200, {
              'Content-Type': 'text/vtt; charset=utf-8',
              'Content-Length': stat.size,
              'Access-Control-Allow-Origin': '*'
            })
            createReadStream(filePath).pipe(res)
          }
          return
        }

        const stat = statSync(filePath)
        const fileSize = stat.size
        const contentType =
          MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream'
        const range = req.headers.range

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-')
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
          const chunkSize = end - start + 1

          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
          })

          pipeWithErrorHandling(createReadStream(filePath, { start, end }), res)
        } else {
          res.writeHead(200, {
            'Content-Length': fileSize,
            'Accept-Ranges': 'bytes',
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
          })

          pipeWithErrorHandling(createReadStream(filePath), res)
        }
      } catch {
        res.writeHead(404)
        res.end('File not found')
      }
    })

    server.listen(0, '127.0.0.1', () => {
      const addr = server!.address()
      if (addr && typeof addr === 'object') {
        port = addr.port
        console.log(`Video server listening on http://127.0.0.1:${port}`)
        resolve(port)
      } else {
        reject(new Error('Failed to get server address'))
      }
    })
  })
}

export function getVideoServerPort(): number {
  return port
}

export function stopVideoServer(): void {
  if (server) {
    server.close()
    server = null
  }
  lastRangeStartBySession.clear()
}
