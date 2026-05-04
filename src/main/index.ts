import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerMovieHandlers } from './ipc/movies'
import { registerTorrentHandlers } from './ipc/torrents'
import { registerDownloadHandlers } from './ipc/downloads'
import { initEngine, shutdownEngine } from './services/torrent/engine'
import { registerLibraryHandlers } from './ipc/library'
import { registerSettingsHandlers } from './ipc/settings'
import { registerSubtitleHandlers } from './ipc/subtitles'
import { registerStreamingHandlers } from './ipc/streaming'
import { registerUpdaterHandlers } from './ipc/updater'
import { startVideoServer, getVideoServerPort } from './services/video-server'
import { shutdownAllStreams } from './services/torrent/stream-engine'
import { initUpdater, shutdownUpdater } from './services/updater'
import { flushLibrarySync } from './db'
import { flushSettingsSync } from './services/settings'
import { windowConfig } from './config/window'

function createWindow(): BrowserWindow {
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

  return mainWindow
}

app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')

// utp-native / UDP transport errors fire from timer callbacks deep inside
// WebTorrent and bypass any try/catch in our code. Swallow them here so the
// app keeps running instead of showing the "JavaScript error" dialog.
function isBenignNetworkError(err: unknown): boolean {
  const code = (err as { code?: string })?.code
  const msg = err instanceof Error ? err.message : String(err)
  return (
    code === 'ENOBUFS' ||
    code === 'EADDRINUSE' ||
    code === 'EAFNOSUPPORT' ||
    code === 'ENETUNREACH' ||
    code === 'EHOSTUNREACH' ||
    /no buffer space available/i.test(msg) ||
    /UTP\.(bind|connect)/i.test(msg)
  )
}

process.on('uncaughtException', (err) => {
  if (isBenignNetworkError(err)) {
    console.warn('[main] swallowed benign network error:', err)
    return
  }
  console.error('[main] uncaughtException:', err)
})

process.on('unhandledRejection', (reason) => {
  if (isBenignNetworkError(reason)) {
    console.warn('[main] swallowed benign network rejection:', reason)
    return
  }
  console.error('[main] unhandledRejection:', reason)
})

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
  registerUpdaterHandlers()

  // Restore download state after restart
  await initEngine()

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

  const mainWindow = createWindow()
  initUpdater(mainWindow)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  shutdownAllStreams()
  shutdownEngine()
  shutdownUpdater()
  flushLibrarySync()
  flushSettingsSync()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
