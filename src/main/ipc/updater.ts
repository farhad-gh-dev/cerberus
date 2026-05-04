import { ipcMain } from 'electron'
import {
  checkForUpdates,
  downloadUpdate,
  getUpdaterStatus,
  quitAndInstall
} from '../services/updater'

export function registerUpdaterHandlers(): void {
  ipcMain.handle('updater:status', () => getUpdaterStatus())
  ipcMain.handle('updater:check', () => checkForUpdates())
  ipcMain.handle('updater:download', () => downloadUpdate())
  ipcMain.handle('updater:install', () => {
    quitAndInstall()
    return true
  })
}
