import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { MovieSearchItem, TrendingMovie, LibraryMovie } from '@shared/types'

import { useSettingsStore } from '../stores/settings'

const MAX_PAGES = 5

export interface MovieEnrichment {
  imdbId: string | null
  runtime: string
  hasTorrents: boolean
}

// ── Types ────────────────────────────────────────────────────────────────

export type MovieCategory = 'trending' | 'popular' | 'top-rated'

/** Identifies the movie currently open in the detail modal. */
export interface SelectedMovie {
  tmdbId: number
  imdbId?: string
}

export interface EnrichedSearchItem extends MovieSearchItem {
  enrichment: MovieEnrichment
}

/** Grouped search state — updated atomically to avoid intermediate inconsistencies. */
interface SearchState {
  results: EnrichedSearchItem[]
  searched: boolean
  loading: boolean
  error: string | null
}

interface CategoryState {
  movies: EnrichedMovie[]
  loading: boolean
  loadingMore: boolean
  error: boolean
  page: number
  hasMore: boolean
}

export interface EnrichedMovie extends TrendingMovie {
  enrichment: MovieEnrichment
}

const INITIAL_SEARCH: SearchState = {
  results: [],
  searched: false,
  loading: false,
  error: null
}

const INITIAL_CATEGORY: CategoryState = {
  movies: [],
  loading: true,
  loadingMore: false,
  error: false,
  page: 1,
  hasMore: true
}

// ── Helpers ──────────────────────────────────────────────────────────────

const categoryFetcher: Record<MovieCategory, (page?: number) => Promise<TrendingMovie[]>> = {
  trending: (page) => window.api.tmdb.trending(page),
  popular: (page) => window.api.tmdb.popular(page),
  'top-rated': (page) => window.api.tmdb.topRated(page)
}

// Drops rejections too — without confirmed torrent availability, showing the
// movie reintroduces the flicker.
async function enrichAndFilter(movies: TrendingMovie[]): Promise<EnrichedMovie[]> {
  const results = await Promise.allSettled(
    movies.map((m) => window.api.tmdb.enrich(m.tmdbId, m.title))
  )
  const out: EnrichedMovie[] = []
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.hasTorrents) {
      out.push({ ...movies[i], enrichment: r.value })
    }
  })
  return out
}

async function enrichAndFilterSearch(items: MovieSearchItem[]): Promise<EnrichedSearchItem[]> {
  const results = await Promise.allSettled(items.map((m) => window.api.tmdb.enrich(m.id, m.title)))
  const out: EnrichedSearchItem[] = []
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.hasTorrents) {
      out.push({ ...items[i], enrichment: r.value })
    }
  })
  return out
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useHome() {
  const [search, setSearch] = useState<SearchState>(INITIAL_SEARCH)
  const [category, setCategory] = useState<MovieCategory>('trending')
  const [categoryState, setCategoryState] = useState<CategoryState>(INITIAL_CATEGORY)
  const loadingMoreRef = useRef(false)
  const categoryStateRef = useRef(categoryState)
  categoryStateRef.current = categoryState
  const categoryRef = useRef(category)
  categoryRef.current = category
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

  const fetchCategory = useCallback(async (cat: MovieCategory) => {
    setCategoryState(INITIAL_CATEGORY)
    loadingMoreRef.current = false

    try {
      const raw = await categoryFetcher[cat](1)
      const enriched = await enrichAndFilter(raw)
      if (categoryRef.current !== cat) return
      setCategoryState({
        movies: enriched,
        loading: false,
        loadingMore: false,
        error: false,
        page: 1,
        hasMore: raw.length > 0 && 1 < MAX_PAGES
      })
    } catch {
      if (categoryRef.current !== cat) return
      setCategoryState({
        movies: [],
        loading: false,
        loadingMore: false,
        error: true,
        page: 1,
        hasMore: false
      })
    }
  }, [])

  useEffect(() => {
    fetchCategory(category)
    loadLibrary()
    loadSettings()
  }, [loadLibrary, loadSettings, fetchCategory, category])

  const changeCategory = useCallback((cat: MovieCategory) => {
    if (cat === categoryRef.current) return
    setCategory(cat)
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current) return
    loadingMoreRef.current = true
    setCategoryState((prev) => ({ ...prev, loadingMore: true }))

    const startCategory = categoryRef.current
    try {
      const nextPage = categoryStateRef.current.page + 1
      const raw = await categoryFetcher[startCategory](nextPage)
      const enriched = await enrichAndFilter(raw)
      if (categoryRef.current !== startCategory) return
      setCategoryState((prev) => ({
        ...prev,
        movies: [...prev.movies, ...enriched],
        loadingMore: false,
        page: nextPage,
        hasMore: raw.length > 0 && nextPage < MAX_PAGES
      }))
    } catch {
      if (categoryRef.current !== startCategory) return
      setCategoryState((prev) => ({ ...prev, loadingMore: false, hasMore: false }))
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

  const libraryByTitleYear = useMemo(
    () => new Map(libraryMovies.map((m) => [`${m.title.toLowerCase()}|${m.year}`, m])),
    [libraryMovies]
  )

  const getLibraryEntry = useCallback(
    (imdbId: string | null | undefined) => {
      if (!imdbId) return undefined
      return libraryByImdbId.get(imdbId)
    },
    [libraryByImdbId]
  )

  const getLibraryEntryByTitleYear = useCallback(
    (title: string, year: string) => {
      return libraryByTitleYear.get(`${title.toLowerCase()}|${year}`)
    },
    [libraryByTitleYear]
  )

  // ── Search handlers ─────────────────────────────────────────────────

  const handleSearch = useCallback(async (query: string) => {
    setSearch({ results: [], searched: true, loading: true, error: null })
    try {
      const res = await window.api.movies.search(query)
      const enriched = await enrichAndFilterSearch(res.results)
      setSearch({
        results: enriched,
        searched: true,
        loading: false,
        error: enriched.length === 0 ? 'No results found' : null
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
    category,
    categoryState,
    selectedMovie,
    hasApiKey,
    getLibraryEntry,
    getLibraryEntryByTitleYear,
    changeCategory,
    handleSearch,
    handleReset,
    selectMovie,
    clearSelection,
    loadMore
  } as const
}
