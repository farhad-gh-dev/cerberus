import { ipcMain } from 'electron'
import {
  startDownload,
  pauseDownload,
  resumeDownload,
  cancelDownload,
  getDownloads,
  deleteDownload,
  getPeers
} from '../services/download-manager'

export function registerDownloadHandlers(): void {
  ipcMain.handle(
    'download:start',
    async (_event, magnetLink: string, name: string, imdbId?: string) => {
      return startDownload(magnetLink, name, undefined, imdbId)
    }
  )

  ipcMain.handle('download:start-magnet', async (_event, magnetLink: string, name: string) => {
    return startDownload(magnetLink, name, undefined, undefined, true)
  })

  ipcMain.handle('download:pause', async (_event, id: string) => {
    return pauseDownload(id)
  })

  ipcMain.handle('download:resume', async (_event, id: string) => {
    return resumeDownload(id)
  })

  ipcMain.handle('download:cancel', async (_event, id: string) => {
    return cancelDownload(id)
  })

  ipcMain.handle('download:delete', async (_event, id: string) => {
    return deleteDownload(id)
  })

  ipcMain.handle('download:list', async () => {
    return getDownloads()
  })

  ipcMain.handle('download:peers', async (_event, id: string) => {
    return getPeers(id)
  })
}
