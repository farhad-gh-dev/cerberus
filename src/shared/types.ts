// ---------- Movie API response types ----------

export interface MovieSearchItem {
  id: number
  title: string
  year: string
  posterUrl: string
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
  year: string
  posterUrl: string
  rating: string
}

// ---------- App-level types ----------

export interface AppSettings {
  downloadPath: string
  tmdbApiKey: string
  externalPlayerPath: string
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
  filePath?: string
  addedAt: string
}

export interface DownloadItem {
  id: string
  name: string
  magnetLink: string
  savePath: string
  status: 'downloading' | 'paused' | 'completed' | 'error'
  progress: number
  downloadSpeed: number
  uploadSpeed: number
  downloaded: number
  totalSize: number
  timeRemaining: number
  peers: number
  isCustom?: boolean
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
