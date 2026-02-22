import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
  },
  movies: {
    search: (query: string, page?: number) => ipcRenderer.invoke('movies:search', query, page),
    details: (tmdbId: number) => ipcRenderer.invoke('movies:details', tmdbId)
  },
  tmdb: {
    backdrop: (imdbId: string) =>
      ipcRenderer.invoke('tmdb:backdrop', imdbId) as Promise<{
        backdrop: string | null
        poster: string | null
      }>,
    trending: () => ipcRenderer.invoke('tmdb:trending')
  },
  torrent: {
    search: (query: string, imdbId?: string) => ipcRenderer.invoke('torrent:search', query, imdbId)
  },
  download: {
    start: (magnetLink: string, name: string, imdbId?: string) =>
      ipcRenderer.invoke('download:start', magnetLink, name, imdbId),
    startMagnet: (magnetLink: string, name: string) =>
      ipcRenderer.invoke('download:start-magnet', magnetLink, name),
    pause: (id: string) => ipcRenderer.invoke('download:pause', id),
    resume: (id: string) => ipcRenderer.invoke('download:resume', id),
    cancel: (id: string) => ipcRenderer.invoke('download:cancel', id),
    delete: (id: string) => ipcRenderer.invoke('download:delete', id),
    list: () => ipcRenderer.invoke('download:list'),
    peers: (id: string) => ipcRenderer.invoke('download:peers', id),
    onProgress: (callback: (items: unknown) => void) => {
      const handler = (_event: unknown, items: unknown): void => callback(items)
      ipcRenderer.on('download:progress', handler)
      return () => ipcRenderer.removeListener('download:progress', handler)
    }
  },
  library: {
    list: () => ipcRenderer.invoke('library:list'),
    get: (imdbId: string) => ipcRenderer.invoke('library:get', imdbId),
    add: (movie: Omit<import('../shared/types').LibraryMovie, 'id' | 'addedAt'>) =>
      ipcRenderer.invoke('library:add', movie),
    remove: (id: number, deleteSource?: boolean) =>
      ipcRenderer.invoke('library:remove', id, deleteSource),
    openFile: (filePath: string) => ipcRenderer.invoke('library:open-file', filePath),
    openFolder: (filePath: string) => ipcRenderer.invoke('library:open-folder', filePath),
    resolveVideo: (filePath: string, movieTitle?: string, movieYear?: string) =>
      ipcRenderer.invoke('library:resolve-video', filePath, movieTitle, movieYear),
    pickVideo: () => ipcRenderer.invoke('library:pick-video'),
    setVideoPath: (id: number, filePath: string) =>
      ipcRenderer.invoke('library:set-video-path', id, filePath),
    clearFile: (id: number, deleteSource?: boolean) =>
      ipcRenderer.invoke('library:clear-file', id, deleteSource),
    clear: () => ipcRenderer.invoke('library:clear')
  },
  video: {
    serverPort: () => ipcRenderer.invoke('video:server-port') as Promise<number>
  },
  settings: {
    getAll: () => ipcRenderer.invoke('settings:get-all'),
    set: (key: string, value: string | boolean) => ipcRenderer.invoke('settings:set', key, value),
    pickFolder: () => ipcRenderer.invoke('settings:pick-folder'),
    pickPlayer: () => ipcRenderer.invoke('settings:pick-player')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
