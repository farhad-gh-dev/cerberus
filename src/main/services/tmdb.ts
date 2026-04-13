import axios from 'axios'
import type {
  TrendingMovie,
  MovieSearchItem,
  MovieSearchResponse,
  MovieDetail
} from '../../shared/types'
import type {
  TMDbFindResult,
  TMDbSearchResponse as TMDbSearchResp,
  TMDbTrendingItem,
  TMDbExternalIds,
  TMDbMovieDetailFull
} from '../types/tmdb'
import { getSetting } from './settings'
import { searchTorrents } from './torrent-search'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

// ---------- Helpers ----------

function tmdbClient() {
  return axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: { api_key: getSetting('tmdbApiKey') }
  })
}

function imgUrl(path: string | null, size = 'w500'): string {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : ''
}

const year = (date?: string): string => date?.slice(0, 4) ?? ''

// ---------- Public API ----------

export async function getBackdropByImdbId(
  imdbId: string
): Promise<{ backdrop: string | null; poster: string | null }> {
  try {
    const { data } = await tmdbClient().get<TMDbFindResult>(`/find/${imdbId}`, {
      params: { external_source: 'imdb_id' }
    })

    const movie = data.movie_results?.[0]
    if (!movie) return { backdrop: null, poster: null }

    return {
      backdrop: imgUrl(movie.backdrop_path, 'original') || null,
      poster: imgUrl(movie.poster_path, 'w780') || null
    }
  } catch (err) {
    console.warn('[tmdb] getBackdropByImdbId failed:', err)
    return { backdrop: null, poster: null }
  }
}

export async function findTmdbIdByImdbId(imdbId: string): Promise<number | null> {
  try {
    const { data } = await tmdbClient().get<TMDbFindResult>(`/find/${imdbId}`, {
      params: { external_source: 'imdb_id' }
    })
    return data.movie_results?.[0]?.id ?? null
  } catch (err) {
    console.warn('[tmdb] findTmdbIdByImdbId failed:', err)
    return null
  }
}

export async function getTrendingMovies(page: number = 1): Promise<TrendingMovie[]> {
  try {
    const client = tmdbClient()
    const { data } = await client.get<{ results: TMDbTrendingItem[] }>('/trending/movie/week', {
      params: { page }
    })
    const movies = data.results?.slice(0, 20) || []

    const all = await Promise.all(
      movies.map(async (m) => {
        let imdbId: string | null = null
        try {
          const { data: ids } = await client.get<TMDbExternalIds>(`/movie/${m.id}/external_ids`)
          imdbId = ids.imdb_id
        } catch {
          // Individual ID lookup failure is non-critical
        }

        // Check torrent availability — skip movies with no torrents
        let hasTorrents = false
        if (imdbId) {
          try {
            const torrents = await searchTorrents(m.title, imdbId)
            hasTorrents = torrents.length > 0
          } catch {
            // Torrent check failure — exclude the movie
          }
        }

        return {
          tmdbId: m.id,
          imdbId,
          title: m.title,
          year: year(m.release_date),
          posterUrl: imgUrl(m.poster_path),
          rating: m.vote_average ? m.vote_average.toFixed(1) : '',
          hasTorrents
        }
      })
    )

    return all.filter((m) => m.hasTorrents)
  } catch (err) {
    console.warn('[tmdb] getTrendingMovies failed:', err)
    return []
  }
}

export async function searchMovies(query: string, page: number = 1): Promise<MovieSearchResponse> {
  try {
    const { data } = await tmdbClient().get<TMDbSearchResp>('/search/movie', {
      params: { query, page }
    })

    const items: MovieSearchItem[] = (data.results || []).map((m) => ({
      id: m.id,
      title: m.title,
      year: year(m.release_date),
      posterUrl: imgUrl(m.poster_path)
    }))

    return {
      results: items,
      totalResults: data.total_results,
      page: data.page,
      totalPages: data.total_pages
    }
  } catch (err) {
    console.warn('[tmdb] searchMovies failed:', err)
    return { results: [], totalResults: 0, page: 1, totalPages: 0 }
  }
}

export async function getMovieDetails(tmdbId: number): Promise<MovieDetail | null> {
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
