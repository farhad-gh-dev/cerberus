import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  MovieSearchResponse,
  MovieDetail,
  TorrentResult,
  TrendingMovie,
  DownloadItem,
  PeerInfo,
  LibraryMovie,
  AppSettings
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
        trending: () => Promise<TrendingMovie[]>
      }
      torrent: {
        search: (query: string, imdbId?: string) => Promise<TorrentResult[]>
      }
      download: {
        start: (magnetLink: string, name: string, imdbId?: string) => Promise<string>
        startMagnet: (magnetLink: string, name: string) => Promise<string>
        pause: (id: string) => Promise<boolean>
        resume: (id: string) => Promise<boolean>
        cancel: (id: string) => Promise<boolean>
        delete: (id: string) => Promise<boolean>
        list: () => Promise<DownloadItem[]>
        peers: (id: string) => Promise<PeerInfo[]>
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
      }
      video: {
        serverPort: () => Promise<number>
      }
      settings: {
        getAll: () => Promise<AppSettings>
        set: (key: string, value: string | boolean) => Promise<boolean>
        pickFolder: () => Promise<string | null>
        pickPlayer: () => Promise<string | null>
      }
    }
  }
}
