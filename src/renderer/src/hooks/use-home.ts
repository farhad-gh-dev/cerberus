import { useState, useEffect, useCallback, useMemo } from 'react'
import type { MovieSearchItem, TrendingMovie, LibraryMovie } from '@shared/types'
import type { MovieCardStatus } from '../components/movie-card'
import { useSettingsStore } from '../stores/settings'

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
  error: boolean
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
    error: false
  })
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
      .trending()
      .then((movies) => setTrending({ movies, loading: false, error: false }))
      .catch(() => setTrending({ movies: [], loading: false, error: true }))
    loadLibrary()
    loadSettings()
  }, [loadLibrary, loadSettings])

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
    clearSelection
  } as const
}
