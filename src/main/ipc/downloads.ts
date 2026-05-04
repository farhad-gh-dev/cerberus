import { ipcMain } from 'electron'
import {
  startDownload,
  pauseDownload,
  resumeDownload,
  cancelDownload,
  deleteDownload,
  holdDownload,
  unholdDownload,
  moveInQueue,
  reorderQueue,
  getDownloads,
  getPeers
} from '../services/torrent/engine'

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

  ipcMain.handle('download:pause', async (_event, id: string) => pauseDownload(id))
  ipcMain.handle('download:resume', async (_event, id: string) => resumeDownload(id))
  ipcMain.handle('download:cancel', async (_event, id: string, deleteFiles?: boolean) =>
    cancelDownload(id, deleteFiles)
  )
  ipcMain.handle('download:delete', async (_event, id: string, deleteFiles?: boolean) =>
    deleteDownload(id, deleteFiles)
  )
  ipcMain.handle('download:list', async () => getDownloads())
  ipcMain.handle('download:peers', async (_event, id: string) => getPeers(id))

  ipcMain.handle('download:move-in-queue', async (_event, id: string, direction: 'up' | 'down') =>
    moveInQueue(id, direction)
  )
  ipcMain.handle('download:reorder-queue', async (_event, orderedIds: string[]) =>
    reorderQueue(orderedIds)
  )
  ipcMain.handle('download:hold', async (_event, id: string) => holdDownload(id))
  ipcMain.handle('download:unhold', async (_event, id: string) => unholdDownload(id))
}
