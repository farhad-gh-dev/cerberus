import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerMovieHandlers } from './ipc/movies'
import { registerTorrentHandlers } from './ipc/torrents'
import { registerDownloadHandlers } from './ipc/downloads'
import { initDownloads, shutdownDownloads } from './services/download-lifecycle'
import { registerLibraryHandlers } from './ipc/library'
import { registerSettingsHandlers } from './ipc/settings'
import { registerSubtitleHandlers } from './ipc/subtitles'
import { registerStreamingHandlers } from './ipc/streaming'
import { startVideoServer, getVideoServerPort } from './services/video-server'
import { shutdownAllStreams } from './services/streaming-manager'
import { windowConfig } from './config/window'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: windowConfig.width,
    height: windowConfig.height,
    minWidth: windowConfig.minWidth,
    minHeight: windowConfig.minHeight,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const loadURL = (): void => {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']!).catch(() => {
        setTimeout(loadURL, 200)
      })
    }
    loadURL()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}

app.whenReady().then(async () => {
  // Start local HTTP server for video streaming with range support
  await startVideoServer()

  ipcMain.handle('video:server-port', () => getVideoServerPort())

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerMovieHandlers()
  registerTorrentHandlers()
  registerDownloadHandlers()
  registerLibraryHandlers()
  registerSettingsHandlers()
  registerSubtitleHandlers()
  registerStreamingHandlers()

  // Restore download state after restart
  await initDownloads()

  ipcMain.on('window:minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  })
  ipcMain.on('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize()
    }
  })
  ipcMain.on('window:close', () => {
    BrowserWindow.getFocusedWindow()?.close()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  shutdownAllStreams()
  shutdownDownloads()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
