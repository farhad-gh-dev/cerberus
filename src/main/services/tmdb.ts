import axios from 'axios'
import type {
  TrendingMovie,
  MovieSearchItem,
  MovieSearchResponse,
  MovieDetail,
  TorrentResult
} from '../../shared/types'
import type {
  TMDbFindResult,
  TMDbSearchResponse as TMDbSearchResp,
  TMDbTrendingItem,
  TMDbMovieDetail,
  TMDbMovieDetailFull
} from '../types/tmdb'
import { getSetting } from './settings'
import { searchTorrents } from './torrent-search'
import { TtlCache } from './cache'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

const LISTING_TTL_MS = 15 * 60 * 1000
const DETAIL_TTL_MS = 60 * 60 * 1000

const listingCache = new TtlCache<TrendingMovie[]>(LISTING_TTL_MS)
const detailCache = new TtlCache<MovieDetail | null>(DETAIL_TTL_MS)
const externalIdsCache = new TtlCache<{ imdbId: string | null; runtime: number | null }>(
  DETAIL_TTL_MS
)
const findByImdbCache = new TtlCache<{
  tmdbId: number | null
  backdrop: string | null
  poster: string | null
}>(DETAIL_TTL_MS)
const torrentAvailabilityCache = new TtlCache<TorrentResult[]>(LISTING_TTL_MS)

// ---------- Helpers ----------

function tmdbClient(): ReturnType<typeof axios.create> {
  return axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: { api_key: getSetting('tmdbApiKey') }
  })
}

function imgUrl(path: string | null, size = 'w500'): string {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : ''
}

const year = (date?: string): string => date?.slice(0, 4) ?? ''

const TMDB_GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
}

// ---------- Public API ----------

async function findByImdb(
  imdbId: string
): Promise<{ tmdbId: number | null; backdrop: string | null; poster: string | null }> {
  return findByImdbCache.resolve(imdbId, async () => {
    try {
      const { data } = await tmdbClient().get<TMDbFindResult>(`/find/${imdbId}`, {
        params: { external_source: 'imdb_id' }
      })
      const movie = data.movie_results?.[0]
      if (!movie) return { tmdbId: null, backdrop: null, poster: null }
      return {
        tmdbId: movie.id ?? null,
        backdrop: imgUrl(movie.backdrop_path, 'original') || null,
        poster: imgUrl(movie.poster_path, 'w780') || null
      }
    } catch (err) {
      console.warn('[tmdb] findByImdb failed:', err)
      return { tmdbId: null, backdrop: null, poster: null }
    }
  })
}

export async function getBackdropByImdbId(
  imdbId: string
): Promise<{ backdrop: string | null; poster: string | null }> {
  const { backdrop, poster } = await findByImdb(imdbId)
  return { backdrop, poster }
}

export async function findTmdbIdByImdbId(imdbId: string): Promise<number | null> {
  return (await findByImdb(imdbId)).tmdbId
}

async function getExternalIds(
  tmdbId: number
): Promise<{ imdbId: string | null; runtime: number | null }> {
  return externalIdsCache.resolve(`tmdb:${tmdbId}`, async () => {
    try {
      const { data } = await tmdbClient().get<TMDbMovieDetail>(`/movie/${tmdbId}`)
      return { imdbId: data.imdb_id ?? null, runtime: data.runtime ?? null }
    } catch {
      return { imdbId: null, runtime: null }
    }
  })
}

async function getTorrentsForMovie(title: string, imdbId: string): Promise<TorrentResult[]> {
  return torrentAvailabilityCache.resolve(`yts:${imdbId}`, () => searchTorrents(title, imdbId))
}

// imdbId/runtime/hasTorrents are filled in lazily via enrichMovie — fetching
// them for every listing item turns one page load into 40+ network calls.
function shapeTrending(m: TMDbTrendingItem): TrendingMovie {
  return {
    tmdbId: m.id,
    imdbId: null,
    title: m.title,
    originalTitle: m.original_title,
    originalLanguage: m.original_language,
    overview: m.overview,
    year: year(m.release_date),
    posterUrl: imgUrl(m.poster_path),
    backdropUrl: imgUrl(m.backdrop_path, 'w780'),
    genreIds: m.genre_ids,
    genres: m.genre_ids.map((id) => TMDB_GENRE_MAP[id]).filter(Boolean),
    popularity: m.popularity,
    rating: m.vote_average ? m.vote_average.toFixed(1) : '',
    runtime: '',
    voteCount: m.vote_count,
    adult: m.adult
  }
}

async function fetchListing(
  endpoint: string,
  page: number,
  cacheKey: string
): Promise<TrendingMovie[]> {
  return listingCache.resolve(`${cacheKey}:${page}`, async () => {
    const { data } = await tmdbClient().get<{ results: TMDbTrendingItem[] }>(endpoint, {
      params: { page }
    })
    return (data.results?.slice(0, 20) || []).map(shapeTrending)
  })
}

export async function enrichMovie(
  tmdbId: number,
  title: string
): Promise<{ imdbId: string | null; runtime: string; hasTorrents: boolean }> {
  const { imdbId, runtime } = await getExternalIds(tmdbId)
  let hasTorrents = false
  if (imdbId) {
    try {
      const torrents = await getTorrentsForMovie(title, imdbId)
      hasTorrents = torrents.length > 0
    } catch {
      /* ignore */
    }
  }
  return {
    imdbId,
    runtime: runtime ? `${runtime} min` : '',
    hasTorrents
  }
}

export async function getTrendingMovies(page: number = 1): Promise<TrendingMovie[]> {
  try {
    return await fetchListing('/trending/movie/week', page, 'trending')
  } catch (err) {
    console.warn('[tmdb] getTrendingMovies failed:', err)
    return []
  }
}

export async function getPopularMovies(page: number = 1): Promise<TrendingMovie[]> {
  try {
    return await fetchListing('/movie/popular', page, 'popular')
  } catch (err) {
    console.warn('[tmdb] getPopularMovies failed:', err)
    return []
  }
}

export async function getTopRatedMovies(page: number = 1): Promise<TrendingMovie[]> {
  try {
    return await fetchListing('/movie/top_rated', page, 'topRated')
  } catch (err) {
    console.warn('[tmdb] getTopRatedMovies failed:', err)
    return []
  }
}

const searchCache = new TtlCache<MovieSearchResponse>(LISTING_TTL_MS, 200)

export async function searchMovies(query: string, page: number = 1): Promise<MovieSearchResponse> {
  const key = `${query.toLowerCase().trim()}:${page}`
  try {
    return await searchCache.resolve(key, async () => {
      const { data } = await tmdbClient().get<TMDbSearchResp>('/search/movie', {
        params: { query, page }
      })

      const items: MovieSearchItem[] = (data.results || []).map((m) => ({
        id: m.id,
        title: m.title,
        year: year(m.release_date),
        posterUrl: imgUrl(m.poster_path),
        rating: m.vote_average ? m.vote_average.toFixed(1) : '',
        genres: (m.genre_ids || []).map((id) => TMDB_GENRE_MAP[id]).filter(Boolean),
        language: m.original_language || ''
      }))

      return {
        results: items,
        totalResults: data.total_results,
        page: data.page,
        totalPages: data.total_pages
      }
    })
  } catch (err) {
    console.warn('[tmdb] searchMovies failed:', err)
    return { results: [], totalResults: 0, page: 1, totalPages: 0 }
  }
}

export async function getMovieDetails(tmdbId: number): Promise<MovieDetail | null> {
  return detailCache.resolve(`detail:${tmdbId}`, () => fetchMovieDetail(tmdbId))
}

async function fetchMovieDetail(tmdbId: number): Promise<MovieDetail | null> {
  try {
    const { data: movie } = await tmdbClient().get<TMDbMovieDetailFull>(`/movie/${tmdbId}`, {
      params: { append_to_response: 'credits,release_dates,external_ids' }
    })

    const usRelease = movie.release_dates.results?.find((r) => r.iso_3166_1 === 'US')
    const certification =
      usRelease?.release_dates?.find((rd) => rd.certification)?.certification || ''

    const directors = movie.credits.crew.filter((c) => c.job === 'Director').map((c) => c.name)
    const writers = movie.credits.crew.filter((c) => c.department === 'Writing').map((c) => c.name)
    const cast = movie.credits.cast
      .sort((a, b) => a.order - b.order)
      .slice(0, 10)
      .map((c) => c.name)

    const runtimeMin = movie.runtime
    const runtimeStr = runtimeMin ? `${Math.floor(runtimeMin / 60)}h ${runtimeMin % 60}min` : ''

    return {
      tmdbId: movie.id,
      imdbId: movie.external_ids.imdb_id || '',
      title: movie.title,
      year: year(movie.release_date),
      rated: certification,
      runtime: runtimeStr,
      genre: movie.genres.map((g) => g.name).join(', '),
      director: directors.join(', '),
      writer: writers.join(', '),
      actors: cast.join(', '),
      plot: movie.overview || '',
      language: movie.original_language || '',
      posterUrl: imgUrl(movie.poster_path, 'w780'),
      backdropUrl: imgUrl(movie.backdrop_path, 'original'),
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : '',
      votes: movie.vote_count ? movie.vote_count.toLocaleString() : '',
      boxOffice: movie.revenue ? `$${movie.revenue.toLocaleString()}` : ''
    }
  } catch (err) {
    console.warn('[tmdb] getMovieDetails failed:', err)
    return null
  }
}
