// ---------- Movie API response types ----------

export interface MovieSearchItem {
  id: number
  title: string
  year: string
  posterUrl: string
  rating: string
  genres: string[]
  language: string
}

export interface MovieSearchResponse {
  results: MovieSearchItem[]
  totalResults: number
  page: number
  totalPages: number
}

export interface MovieDetail {
  tmdbId: number
  imdbId: string
  title: string
  year: string
  rated: string
  runtime: string
  genre: string
  director: string
  writer: string
  actors: string
  plot: string
  language: string
  posterUrl: string
  backdropUrl: string
  rating: string
  votes: string
  boxOffice: string
}

// ---------- Torrent types ----------

export interface TorrentResult {
  source: string
  name: string
  magnetLink: string
  size: string
  seeds: number
  peers: number
  quality: string
}

// YTS API response shapes
export interface YTSTorrent {
  url: string
  hash: string
  quality: string
  type: string
  is_repack: string
  video_codec: string
  bit_depth: string
  audio_channels: string
  seeds: number
  peers: number
  size: string
  size_bytes: number
  date_uploaded: string
}

export interface YTSMovie {
  id: number
  imdb_code: string
  title: string
  title_long: string
  year: number
  rating: number
  runtime: number
  genres: string[]
  torrents: YTSTorrent[]
}

export interface YTSListResponse {
  status: string
  status_message: string
  data: {
    movie_count: number
    limit: number
    page_number: number
    movies?: YTSMovie[]
  }
}

// ---------- TMDb types ----------

export interface TrendingMovie {
  tmdbId: number
  imdbId: string | null
  title: string
  originalTitle: string
  originalLanguage: string
  overview: string
  year: string
  posterUrl: string
  backdropUrl: string
  genreIds: number[]
  genres: string[]
  popularity: number
  rating: string
  runtime: string
  voteCount: number
  adult: boolean
}

// ---------- App-level types ----------

export interface AppSettings {
  downloadPath: string
  tmdbApiKey: string
  externalPlayerPath: string
  externalPlayerEnabled: boolean
  maxConcurrentDownloads: number
  subtitleProvider: 'opensubtitles' | 'subdl'
  openSubtitlesApiKey: string
  subdlApiKey: string
  /** Enable µTP transport for the WebTorrent client. Default off (Windows ENOBUFS source). */
  utpEnabled: boolean
  /** Download every file in a torrent rather than auto-deselecting samples/NFOs. */
  keepExtras: boolean
}

export interface LibraryMovie {
  id: number
  imdbId: string
  title: string
  year: string
  posterUrl: string
  plot: string
  genre: string
  director: string
  actors: string
  imdbRating: string
  runtime: string
  language: string
  filePath?: string
  addedAt: string
}

export interface DownloadItem {
  id: string
  name: string
  magnetLink: string
  savePath: string
  imdbId?: string
  status: 'downloading' | 'paused' | 'completed' | 'error' | 'queued' | 'on-hold'
  progress: number
  downloadSpeed: number
  uploadSpeed: number
  downloaded: number
  totalSize: number
  timeRemaining: number
  peers: number
  isCustom?: boolean
  priority: number
  completedAt?: string
}

// ---------- Peer types ----------

export interface PeerInfo {
  id: string
  address: string
  port: number
  client: string
  downloadSpeed: number
  uploadSpeed: number
  downloaded: number
  uploaded: number
  progress: number
  location?: PeerLocation
}

export interface PeerLocation {
  lat: number
  lon: number
  city: string
  country: string
  countryCode: string
  isp: string
}

// ---------- Subtitle types ----------

export interface SubtitleTrack {
  filePath: string
  label: string
  language: string
  format: string
}

export interface OnlineSubtitleResult {
  /** Unique identifier — OpenSubtitles numeric ID or Subdl URL */
  id: string
  provider: 'opensubtitles' | 'subdl'
  fileName: string
  language: string
  languageCode: string
  downloadCount: number
  rating: number
  format: string
  /** Direct download URL (Subdl) — OpenSubtitles uses its own download endpoint */
  downloadUrl?: string
}

// ---------- Auto-updater ----------

export type UpdaterPhase =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export interface UpdaterStatus {
  phase: UpdaterPhase
  currentVersion: string
  availableVersion: string | null
  releaseNotes: string | null
  releaseName: string | null
  releaseDate: string | null
  downloadPercent: number
  bytesPerSecond: number
  transferred: number
  total: number
  error: string | null
  lastCheckedAt: number | null
}
