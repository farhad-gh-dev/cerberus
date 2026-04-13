import { ipcMain } from 'electron'
import { startDownload, getDownloads, getPeers } from '../services/download-manager'
import {
  pauseDownload,
  resumeDownload,
  cancelDownload,
  deleteDownload,
  holdDownload,
  unholdDownload
} from '../services/download-actions'
import { moveInQueue, reorderQueue } from '../services/download-queue'

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

  ipcMain.handle('download:move-in-queue', async (_event, id: string, direction: 'up' | 'down') => {
    return moveInQueue(id, direction)
  })

  ipcMain.handle('download:reorder-queue', async (_event, orderedIds: string[]) => {
    return reorderQueue(orderedIds)
  })

  ipcMain.handle('download:hold', async (_event, id: string) => {
    return holdDownload(id)
  })

  ipcMain.handle('download:unhold', async (_event, id: string) => {
    return unholdDownload(id)
  })
}
