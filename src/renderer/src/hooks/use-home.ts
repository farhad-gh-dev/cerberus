import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { MovieSearchItem, TrendingMovie, LibraryMovie } from '@shared/types'
import type { MovieCardStatus } from '../components/movie-card'
import { useSettingsStore } from '../stores/settings'

const MAX_TRENDING_PAGES = 5

// ── Types ────────────────────────────────────────────────────────────────

/** Identifies the movie currently open in the detail modal. */
export interface SelectedMovie {
  tmdbId: number
  imdbId?: string
}

/** Grouped search state — updated atomically to avoid intermediate inconsistencies. */
interface SearchState {
  results: MovieSearchItem[]
  searched: boolean
  loading: boolean
  error: string | null
}

/** Grouped trending state. */
interface TrendingState {
  movies: TrendingMovie[]
  loading: boolean
  loadingMore: boolean
  error: boolean
  page: number
  hasMore: boolean
}

const INITIAL_SEARCH: SearchState = {
  results: [],
  searched: false,
  loading: false,
  error: null
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useHome() {
  const [search, setSearch] = useState<SearchState>(INITIAL_SEARCH)
  const [trending, setTrending] = useState<TrendingState>({
    movies: [],
    loading: true,
    loadingMore: false,
    error: false,
    page: 1,
    hasMore: true
  })
  const loadingMoreRef = useRef(false)
  const trendingRef = useRef(trending)
  trendingRef.current = trending
  const [libraryMovies, setLibraryMovies] = useState<LibraryMovie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<SelectedMovie | null>(null)

  const { settings, load: loadSettings } = useSettingsStore()
  const hasApiKey = !!settings?.tmdbApiKey

  // ── Data fetching ───────────────────────────────────────────────────

  const loadLibrary = useCallback(() => {
    window.api.library
      .list()
      .then(setLibraryMovies)
      .catch(() => setLibraryMovies([]))
  }, [])

  useEffect(() => {
    window.api.tmdb
      .trending(1)
      .then((movies) =>
        setTrending({
          movies,
          loading: false,
          loadingMore: false,
          error: false,
          page: 1,
          hasMore: movies.length > 0 && 1 < MAX_TRENDING_PAGES
        })
      )
      .catch(() =>
        setTrending({
          movies: [],
          loading: false,
          loadingMore: false,
          error: true,
          page: 1,
          hasMore: false
        })
      )
    loadLibrary()
    loadSettings()
  }, [loadLibrary, loadSettings])

  const loadMoreTrending = useCallback(async () => {
    if (loadingMoreRef.current) return
    loadingMoreRef.current = true
    setTrending((prev) => ({ ...prev, loadingMore: true }))

    try {
      const nextPage = trendingRef.current.page + 1
      const movies = await window.api.tmdb.trending(nextPage)
      setTrending((prev) => ({
        ...prev,
        movies: [...prev.movies, ...movies],
        loadingMore: false,
        page: nextPage,
        hasMore: movies.length > 0 && nextPage < MAX_TRENDING_PAGES
      }))
    } catch {
      setTrending((prev) => ({ ...prev, loadingMore: false, hasMore: false }))
    } finally {
      loadingMoreRef.current = false
    }
  }, [])

  // ── Library status lookup ───────────────────────────────────────────
  // Build a Map for O(1) lookups instead of Array.find() per card.

  const libraryByImdbId = useMemo(
    () => new Map(libraryMovies.map((m) => [m.imdbId, m])),
    [libraryMovies]
  )

  const getCardStatus = useCallback(
    (imdbId: string | null | undefined): MovieCardStatus => {
      if (!imdbId) return 'none'
      const lib = libraryByImdbId.get(imdbId)
      if (!lib) return 'none'
      return lib.filePath ? 'downloaded' : 'in-library'
    },
    [libraryByImdbId]
  )

  // ── Search handlers ─────────────────────────────────────────────────

  const handleSearch = useCallback(async (query: string) => {
    setSearch({ results: [], searched: true, loading: true, error: null })
    try {
      const res = await window.api.movies.search(query)
      setSearch({
        results: res.results,
        searched: true,
        loading: false,
        error: res.results.length === 0 ? 'No results found' : null
      })
    } catch {
      setSearch({
        results: [],
        searched: true,
        loading: false,
        error: 'Failed to search. Check your connection.'
      })
    }
  }, [])

  const handleReset = useCallback(() => {
    setSearch(INITIAL_SEARCH)
  }, [])

  // ── Movie selection ─────────────────────────────────────────────────

  const selectMovie = useCallback((tmdbId: number, imdbId?: string | null) => {
    setSelectedMovie({ tmdbId, imdbId: imdbId ?? undefined })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedMovie(null)
    loadLibrary() // Refresh library status so badges update after modal closes
  }, [loadLibrary])

  return {
    search,
    trending,
    selectedMovie,
    hasApiKey,
    getCardStatus,
    handleSearch,
    handleReset,
    selectMovie,
    clearSelection,
    loadMoreTrending
  } as const
}
