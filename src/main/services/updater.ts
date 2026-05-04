import { app, BrowserWindow } from 'electron'
import { autoUpdater, type ProgressInfo, type UpdateInfo } from 'electron-updater'
import { is } from '@electron-toolkit/utils'
import type { UpdaterStatus } from '../../shared/types'

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000

let mainWindow: BrowserWindow | null = null
let intervalHandle: NodeJS.Timeout | null = null

const status: UpdaterStatus = {
  phase: 'idle',
  currentVersion: app.getVersion(),
  availableVersion: null,
  releaseNotes: null,
  releaseName: null,
  releaseDate: null,
  downloadPercent: 0,
  bytesPerSecond: 0,
  transferred: 0,
  total: 0,
  error: null,
  lastCheckedAt: null
}

function broadcast(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:status', status)
  }
}

function update(patch: Partial<UpdaterStatus>): void {
  Object.assign(status, patch)
  broadcast()
}

function notesToString(notes: UpdateInfo['releaseNotes']): string | null {
  if (!notes) return null
  if (typeof notes === 'string') return notes
  return notes.map((n) => n.note ?? '').join('\n\n')
}

export function getUpdaterStatus(): UpdaterStatus {
  return status
}

export async function checkForUpdates(): Promise<UpdaterStatus> {
  if (is.dev) {
    update({ phase: 'not-available', lastCheckedAt: Date.now() })
    return status
  }
  try {
    update({ phase: 'checking', error: null })
    await autoUpdater.checkForUpdates()
  } catch (err) {
    update({
      phase: 'error',
      error: err instanceof Error ? err.message : String(err)
    })
  }
  return status
}

export async function downloadUpdate(): Promise<UpdaterStatus> {
  if (status.phase !== 'available') return status
  try {
    update({ phase: 'downloading', downloadPercent: 0, error: null })
    await autoUpdater.downloadUpdate()
  } catch (err) {
    update({
      phase: 'error',
      error: err instanceof Error ? err.message : String(err)
    })
  }
  return status
}

export function quitAndInstall(): void {
  if (status.phase !== 'downloaded') return
  autoUpdater.quitAndInstall()
}

export function initUpdater(window: BrowserWindow): void {
  mainWindow = window

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    update({ phase: 'checking', error: null })
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    update({
      phase: 'available',
      availableVersion: info.version,
      releaseNotes: notesToString(info.releaseNotes),
      releaseName: info.releaseName ?? null,
      releaseDate: info.releaseDate ?? null,
      lastCheckedAt: Date.now()
    })
  })

  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    update({
      phase: 'not-available',
      availableVersion: info.version,
      lastCheckedAt: Date.now()
    })
  })

  autoUpdater.on('download-progress', (p: ProgressInfo) => {
    update({
      phase: 'downloading',
      downloadPercent: p.percent,
      bytesPerSecond: p.bytesPerSecond,
      transferred: p.transferred,
      total: p.total
    })
  })

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    update({
      phase: 'downloaded',
      availableVersion: info.version,
      downloadPercent: 100
    })
  })

  autoUpdater.on('error', (err) => {
    update({
      phase: 'error',
      error: err instanceof Error ? err.message : String(err)
    })
  })

  if (!is.dev) {
    setTimeout(() => {
      void checkForUpdates()
    }, 5000)
    intervalHandle = setInterval(() => {
      // Don't clobber an in-progress or ready-to-install update.
      if (status.phase === 'downloading' || status.phase === 'downloaded') return
      void checkForUpdates()
    }, CHECK_INTERVAL_MS)
  }
}

export function shutdownUpdater(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle)
    intervalHandle = null
  }
  mainWindow = null
}
