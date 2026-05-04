import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  MovieSearchResponse,
  MovieDetail,
  TorrentResult,
  TrendingMovie,
  DownloadItem,
  PeerInfo,
  LibraryMovie,
  AppSettings,
  SubtitleTrack,
  OnlineSubtitleResult,
  UpdaterStatus
} from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
      }
      movies: {
        search: (query: string, page?: number) => Promise<MovieSearchResponse>
        details: (tmdbId: number) => Promise<MovieDetail | null>
      }
      tmdb: {
        backdrop: (imdbId: string) => Promise<{ backdrop: string | null; poster: string | null }>
        trending: (page?: number) => Promise<TrendingMovie[]>
        popular: (page?: number) => Promise<TrendingMovie[]>
        topRated: (page?: number) => Promise<TrendingMovie[]>
        enrich: (
          tmdbId: number,
          title: string
        ) => Promise<{ imdbId: string | null; runtime: string; hasTorrents: boolean }>
      }
      torrent: {
        search: (query: string, imdbId?: string) => Promise<TorrentResult[]>
      }
      download: {
        start: (magnetLink: string, name: string, imdbId?: string) => Promise<string>
        startMagnet: (magnetLink: string, name: string) => Promise<string>
        pause: (id: string) => Promise<boolean>
        resume: (id: string) => Promise<boolean>
        cancel: (id: string, deleteFiles?: boolean) => Promise<boolean>
        delete: (id: string, deleteFiles?: boolean) => Promise<boolean>
        list: () => Promise<DownloadItem[]>
        peers: (id: string) => Promise<PeerInfo[]>
        moveInQueue: (id: string, direction: 'up' | 'down') => Promise<boolean>
        reorderQueue: (orderedIds: string[]) => Promise<boolean>
        hold: (id: string) => Promise<boolean>
        unhold: (id: string) => Promise<boolean>
        onProgress: (callback: (items: DownloadItem[]) => void) => () => void
      }
      library: {
        list: () => Promise<LibraryMovie[]>
        get: (imdbId: string) => Promise<LibraryMovie | null>
        add: (movie: Omit<LibraryMovie, 'id' | 'addedAt'>) => Promise<LibraryMovie>
        remove: (id: number, deleteSource?: boolean) => Promise<boolean>
        openFile: (filePath: string) => Promise<string>
        openFolder: (filePath: string) => Promise<void>
        resolveVideo: (
          filePath: string,
          movieTitle?: string,
          movieYear?: string
        ) => Promise<string | null>
        pickVideo: () => Promise<string | null>
        setVideoPath: (id: number, filePath: string) => Promise<boolean>
        clearFile: (id: number, deleteSource?: boolean) => Promise<boolean>
        clear: () => Promise<boolean>
        resolveSubtitles: (videoPath: string) => Promise<SubtitleTrack[]>
      }
      video: {
        serverPort: () => Promise<number>
      }
      subtitles: {
        searchOnline: (imdbId: string, language?: string) => Promise<OnlineSubtitleResult[]>
        download: (resultId: string, videoFilePath: string) => Promise<SubtitleTrack | null>
      }
      settings: {
        getAll: () => Promise<AppSettings>
        set: (key: string, value: string | boolean | number) => Promise<boolean>
        pickFolder: () => Promise<string | null>
        pickPlayer: () => Promise<string | null>
      }
      updater: {
        status: () => Promise<UpdaterStatus>
        check: () => Promise<UpdaterStatus>
        download: () => Promise<UpdaterStatus>
        install: () => Promise<boolean>
        onStatus: (callback: (status: UpdaterStatus) => void) => () => void
      }
      stream: {
        start: (magnetLink: string) => Promise<{ id: string; fileName: string }>
        stop: (id: string) => Promise<boolean>
        stats: (id: string) => Promise<{
          downloadSpeed: number
          uploadSpeed: number
          numPeers: number
          progress: number
          downloaded: number
          fileLength: number
          numPieces: number
          downloadedRanges: [number, number][]
        } | null>
        seek: (id: string, byteOffset: number) => Promise<boolean>
        filePath: (id: string) => Promise<string | null>
        openExternal: (
          id: string
        ) => Promise<{ ok: true; url: string } | { ok: false; error: string }>
      }
    }
  }
}
