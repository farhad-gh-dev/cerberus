import { useState, useCallback, type FormEvent } from 'react'
import type { MovieSearchItem, LibraryMovie } from '@shared/types'
import { useAsyncAction } from './use-async-action'

// ─── Types ───────────────────────────────────────────────────────

interface AddExistingMovieState {
  filePath: string | null
  query: string
  results: MovieSearchItem[]
  searching: boolean
  searchError: string | null
  /** The TMDB id of the movie currently being added, or null if idle */
  addingId: number | null
  /** True when no async operation is in progress */
  isIdle: boolean
}

interface AddExistingMovieActions {
  setQuery: (query: string) => void
  pickFile: () => Promise<void>
  search: (e: FormEvent) => Promise<void>
  addMovie: (item: MovieSearchItem) => Promise<void>
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
  const [addingId, setAddingId] = useState<number | null>(null)

  const run = useAsyncAction()

  const pickFile = useCallback(async () => {
    const picked = await window.api.library.pickVideo()
    if (picked) setFilePath(picked)
  }, [])

  const search = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const trimmed = query.trim()
      if (!trimmed) return

      setSearching(true)
      setSearchError(null)
      setResults([])

      try {
        const res = await window.api.movies.search(trimmed)
        if (res.results.length > 0) {
          setResults(res.results)
        } else {
          setSearchError('No results found')
        }
      } catch {
        setSearchError('Search failed. Check your connection.')
      } finally {
        setSearching(false)
      }
    },
    [query]
  )

  const addMovie = useCallback(
    async (item: MovieSearchItem) => {
      if (!filePath) return
      setAddingId(item.id)
      try {
        await run(
          async () => {
            const details = await window.api.movies.details(item.id)
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
              filePath
            })
          },
          'Failed to add movie',
          { onSuccess: onAdded }
        )
      } finally {
        setAddingId(null)
      }
    },
    [filePath, run, onAdded]
  )

  return {
    filePath,
    query,
    setQuery,
    results,
    searching,
    searchError,
    addingId,
    isIdle: addingId === null && !searching,
    pickFile,
    search,
    addMovie
  }
}
