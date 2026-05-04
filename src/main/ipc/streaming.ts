import { ipcMain } from 'electron'
import {
  startStreaming,
  stopStreaming,
  getStreamingStats,
  seekStream,
  getStreamingFilePath,
  getStreamingSession,
  markSessionExternal
} from '../services/torrent/stream-engine'
import { getVideoServerPort } from '../services/video-server'
import { spawnExternalPlayer } from '../services/library'

export function registerStreamingHandlers(): void {
  ipcMain.handle('stream:start', async (_event, magnetLink: string) => {
    return startStreaming(magnetLink)
  })

  ipcMain.handle('stream:stop', async (_event, id: string) => {
    return stopStreaming(id)
  })

  ipcMain.handle('stream:stats', (_event, id: string) => {
    return getStreamingStats(id)
  })

  ipcMain.handle('stream:seek', (_event, id: string, byteOffset: number) => {
    return seekStream(id, byteOffset)
  })

  ipcMain.handle('stream:file-path', (_event, id: string) => {
    return getStreamingFilePath(id)
  })

  ipcMain.handle('stream:open-external', (_event, id: string) => {
    const session = getStreamingSession(id)
    if (!session) return { ok: false, error: 'session-not-found' as const }

    const port = getVideoServerPort()
    if (!port) return { ok: false, error: 'server-not-ready' as const }

    // File name in path so external players show it as the title.
    const fileName = encodeURIComponent(session.file.name)
    const url = `http://127.0.0.1:${port}/stream/${fileName}?id=${encodeURIComponent(id)}`
    const launched = spawnExternalPlayer(url)
    if (!launched) return { ok: false, error: 'no-external-player' as const }

    markSessionExternal(id)
    return { ok: true as const, url }
  })
}
