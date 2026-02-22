import { createServer, type Server } from 'http'
import { createReadStream, statSync } from 'fs'
import { extname } from 'path'

let server: Server | null = null
let port = 0

const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.m4v': 'video/x-m4v',
  '.wmv': 'video/x-ms-wmv'
}

export function startVideoServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    server = createServer((req, res) => {
      try {
        const url = new URL(req.url || '/', `http://localhost`)
        const filePath = url.searchParams.get('path')

        if (!filePath) {
          res.writeHead(400)
          res.end('Missing path parameter')
          return
        }

        const stat = statSync(filePath)
        const fileSize = stat.size
        const contentType = MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream'
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

          createReadStream(filePath, { start, end }).pipe(res)
        } else {
          res.writeHead(200, {
            'Content-Length': fileSize,
            'Accept-Ranges': 'bytes',
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
          })

          createReadStream(filePath).pipe(res)
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
}
