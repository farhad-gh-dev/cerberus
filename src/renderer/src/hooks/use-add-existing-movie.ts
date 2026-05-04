import { useState, useCallback, useEffect, useRef } from 'react'
import type { MovieSearchItem, LibraryMovie } from '@shared/types'
import { useAsyncAction } from './use-async-action'

// ─── Types ───────────────────────────────────────────────────────

interface AddExistingMovieState {
  filePath: string | null
  query: string
  results: MovieSearchItem[]
  searching: boolean
  searchError: string | null
  selectedMovie: MovieSearchItem | null
  /** The TMDB id of the movie currently being added, or null if idle */
  addingId: number | null
  /** True when no async operation is in progress */
  isIdle: boolean
}

interface AddExistingMovieActions {
  handleQueryChange: (query: string) => void
  pickFile: () => Promise<void>
  clearFile: () => void
  clearSelectedMovie: () => void
  selectMovie: (item: MovieSearchItem) => void
  submitMovie: () => Promise<void>
}

export type UseAddExistingMovieReturn = AddExistingMovieState & AddExistingMovieActions

// ─── Hook ────────────────────────────────────────────────────────

/**
 * Encapsulates the three-step "add existing movie" workflow:
 * 1. Pick a local video file
 * 2. Search TMDB for a matching title
 * 3. Attach metadata and persist to the library
 *
 * Error handling:
 * - Search failures are surfaced via `searchError` (inline UI).
 * - Add failures are surfaced via toast (through `useAsyncAction`).
 */
export function useAddExistingMovie(
  onAdded: (movie: LibraryMovie) => void
): UseAddExistingMovieReturn {
  const [filePath, setFilePath] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MovieSearchItem[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<MovieSearchItem | null>(null)
  const [addingId, setAddingId] = useState<number | null>(null)

  const run = useAsyncAction()

  const pickFile = useCallback(async () => {
    const picked = await window.api.library.pickVideo()
    if (picked) setFilePath(picked)
  }, [])

  const clearFile = useCallback(() => {
    setFilePath(null)
    setQuery('')
    setResults([])
    setSearchError(null)
    setSelectedMovie(null)
  }, [])

  const clearSelectedMovie = useCallback(() => {
    setSelectedMovie(null)
    setQuery('')
    setResults([])
    setSearchError(null)
  }, [])

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setSelectedMovie(null)
    setSearchError(null)
  }, [])

  const selectMovie = useCallback((item: MovieSearchItem) => {
    setSelectedMovie(item)
    setQuery(item.title + (item.year ? ` (${item.year})` : ''))
    setResults([])
    setSearchError(null)
  }, [])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (selectedMovie) return

    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setSearchError(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    let cancelled = false

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      setSearchError(null)

      try {
        const res = await window.api.movies.search(trimmed)
        if (cancelled) return
        if (res.results.length > 0) {
          setResults(res.results)
        } else {
          setSearchError('No results found')
        }
      } catch {
        if (!cancelled) setSearchError('Search failed. Check your connection.')
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 400)

    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, selectedMovie])

  const submitMovie = useCallback(async () => {
    if (!filePath || !selectedMovie) return
    setAddingId(selectedMovie.id)
    try {
      await run(
        async () => {
          const details = await window.api.movies.details(selectedMovie.id)
          if (!details) throw new Error('Failed to load movie details')
          return window.api.library.add({
            imdbId: details.imdbId,
            title: details.title,
            year: details.year,
            posterUrl: details.posterUrl,
            plot: details.plot,
            genre: details.genre,
            director: details.director,
            actors: details.actors,
            imdbRating: details.rating,
            runtime: details.runtime,
            language: details.language,
            filePath
          })
        },
        'Failed to add movie',
        { onSuccess: onAdded }
      )
    } finally {
      setAddingId(null)
    }
  }, [filePath, selectedMovie, run, onAdded])

  return {
    filePath,
    query,
    results,
    searching,
    searchError,
    selectedMovie,
    addingId,
    isIdle: addingId === null && !searching,
    pickFile,
    clearFile,
    clearSelectedMovie,
    handleQueryChange,
    selectMovie,
    submitMovie
  }
}
