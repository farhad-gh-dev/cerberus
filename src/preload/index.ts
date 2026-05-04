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
    trending: (page?: number) => ipcRenderer.invoke('tmdb:trending', page),
    popular: (page?: number) => ipcRenderer.invoke('tmdb:popular', page),
    topRated: (page?: number) => ipcRenderer.invoke('tmdb:top-rated', page),
    enrich: (tmdbId: number, title: string) =>
      ipcRenderer.invoke('tmdb:enrich', tmdbId, title) as Promise<{
        imdbId: string | null
        runtime: string
        hasTorrents: boolean
      }>
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
    cancel: (id: string, deleteFiles?: boolean) =>
      ipcRenderer.invoke('download:cancel', id, deleteFiles),
    delete: (id: string, deleteFiles?: boolean) =>
      ipcRenderer.invoke('download:delete', id, deleteFiles),
    list: () => ipcRenderer.invoke('download:list'),
    peers: (id: string) => ipcRenderer.invoke('download:peers', id),
    moveInQueue: (id: string, direction: 'up' | 'down') =>
      ipcRenderer.invoke('download:move-in-queue', id, direction),
    reorderQueue: (orderedIds: string[]) =>
      ipcRenderer.invoke('download:reorder-queue', orderedIds),
    hold: (id: string) => ipcRenderer.invoke('download:hold', id),
    unhold: (id: string) => ipcRenderer.invoke('download:unhold', id),
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
    pickVideos: () => ipcRenderer.invoke('library:pick-videos') as Promise<string[]>,
    pickFolderVideos: () => ipcRenderer.invoke('library:pick-folder-videos') as Promise<string[]>,
    setVideoPath: (id: number, filePath: string) =>
      ipcRenderer.invoke('library:set-video-path', id, filePath),
    clearFile: (id: number, deleteSource?: boolean) =>
      ipcRenderer.invoke('library:clear-file', id, deleteSource),
    clear: () => ipcRenderer.invoke('library:clear'),
    resolveSubtitles: (videoPath: string) =>
      ipcRenderer.invoke('library:resolve-subtitles', videoPath)
  },
  video: {
    serverPort: () => ipcRenderer.invoke('video:server-port') as Promise<number>
  },
  subtitles: {
    searchOnline: (imdbId: string, language?: string) =>
      ipcRenderer.invoke('subtitles:search-online', imdbId, language),
    download: (resultId: string, videoFilePath: string) =>
      ipcRenderer.invoke('subtitles:download', resultId, videoFilePath)
  },
  settings: {
    getAll: () => ipcRenderer.invoke('settings:get-all'),
    set: (key: string, value: string | boolean | number) =>
      ipcRenderer.invoke('settings:set', key, value),
    pickFolder: () => ipcRenderer.invoke('settings:pick-folder'),
    pickPlayer: () => ipcRenderer.invoke('settings:pick-player')
  },
  updater: {
    status: () => ipcRenderer.invoke('updater:status'),
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    onStatus: (callback: (status: unknown) => void) => {
      const handler = (_event: unknown, status: unknown): void => callback(status)
      ipcRenderer.on('updater:status', handler)
      return () => ipcRenderer.removeListener('updater:status', handler)
    }
  },
  stream: {
    start: (magnetLink: string) =>
      ipcRenderer.invoke('stream:start', magnetLink) as Promise<{
        id: string
        fileName: string
      }>,
    stop: (id: string) => ipcRenderer.invoke('stream:stop', id) as Promise<boolean>,
    stats: (id: string) =>
      ipcRenderer.invoke('stream:stats', id) as Promise<{
        downloadSpeed: number
        uploadSpeed: number
        numPeers: number
        progress: number
        downloaded: number
        fileLength: number
        numPieces: number
        downloadedRanges: [number, number][]
      } | null>,
    seek: (id: string, byteOffset: number) =>
      ipcRenderer.invoke('stream:seek', id, byteOffset) as Promise<boolean>,
    filePath: (id: string) => ipcRenderer.invoke('stream:file-path', id) as Promise<string | null>,
    openExternal: (id: string) =>
      ipcRenderer.invoke('stream:open-external', id) as Promise<
        { ok: true; url: string } | { ok: false; error: string }
      >
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
  // @ts-ignore (define in dts) — context isolation disabled fallback
  window.electron = electronAPI
  // @ts-ignore (define in dts) — context isolation disabled fallback
  window.api = api
}
