import { ipcMain, dialog } from 'electron'
import { getAllSettings, setSetting } from '../services/settings'

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get-all', () => {
    return getAllSettings()
  })

  ipcMain.handle('settings:set', (_e, key: string, value: string | boolean) => {
    setSetting(key as any, value as any)
    return true
  })

  ipcMain.handle('settings:pick-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('settings:pick-player', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })
}
