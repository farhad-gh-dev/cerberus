import { ipcMain } from 'electron'
import {
  startStreaming,
  stopStreaming,
  getStreamingStats,
  seekStream,
  getStreamingFilePath
} from '../services/streaming-manager'

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
}
