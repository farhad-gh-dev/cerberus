import { useCallback, useEffect, useRef, useState } from 'react'
import type { LibraryMovie, MovieSearchItem } from '@shared/types'
import { basename, parseMovieFilename } from '../utils/parse-filename'
import { useToastStore } from '../stores/toast'

export type RowStatus = 'matching' | 'matched' | 'unmatched' | 'adding' | 'added' | 'error'

export interface ImportRow {
  id: string
  filePath: string
  fileName: string
  parsedQuery: string
  parsedYear?: string
  query: string
  results: MovieSearchItem[]
  searching: boolean
  searchError: string | null
  selectedMovie: MovieSearchItem | null
  editing: boolean
  status: RowStatus
  errorMsg?: string
}

export interface UseBatchImportReturn {
  rows: ImportRow[]
  isCommitting: boolean
  pickFiles: () => Promise<void>
  pickFolder: () => Promise<void>
  reset: () => void
  setQuery: (rowId: string, value: string) => void
  setEditing: (rowId: string, editing: boolean) => void
  selectMovie: (rowId: string, item: MovieSearchItem) => void
  removeRow: (rowId: string) => void
  commit: () => Promise<void>
}

const MATCH_CONCURRENCY = 5
const COMMIT_CONCURRENCY = 4
const SEARCH_DEBOUNCE_MS = 400
const SEARCH_TIMEOUT_MS = 15_000

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out`)), ms)
    p.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e) => {
        clearTimeout(t)
        reject(e)
      }
    )
  })
}

function pickBestMatch(results: MovieSearchItem[], year?: string): MovieSearchItem | null {
  if (results.length === 0) return null
  if (year) {
    const exact = results.find((r) => r.year === year)
    if (exact) return exact
  }
  return results[0]
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  const queue = [...items]
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) {
      const next = queue.shift()
      if (next === undefined) return
      await worker(next)
    }
  })
  await Promise.all(runners)
}

function buildRow(filePath: string): ImportRow {
  const fileName = basename(filePath)
  const { query, year } = parseMovieFilename(filePath)
  return {
    id: crypto.randomUUID(),
    filePath,
    fileName,
    parsedQuery: query,
    parsedYear: year,
    query,
    results: [],
    searching: false,
    searchError: null,
    selectedMovie: null,
    editing: false,
    status: 'matching'
  }
}

export function useBatchImport(
  onCommitted: (movies: LibraryMovie[], fullySucceeded: boolean) => void
): UseBatchImportReturn {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [isCommitting, setIsCommitting] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  // Debounce timers per row id, for the user-edit search path.
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  // Track whether the hook is still mounted so async tasks don't update state after unmount.
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    const timers = debounceTimers.current
    return () => {
      mountedRef.current = false
      for (const t of timers.values()) clearTimeout(t)
      timers.clear()
    }
  }, [])

  const updateRow = useCallback((rowId: string, patch: Partial<ImportRow>) => {
    if (!mountedRef.current) return
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)))
  }, [])

  const autoMatchRow = useCallback(
    async (row: ImportRow) => {
      if (!row.parsedQuery) {
        updateRow(row.id, { status: 'unmatched', searchError: 'Could not parse filename' })
        return
      }
      try {
        const res = await withTimeout(
          window.api.movies.search(row.parsedQuery),
          SEARCH_TIMEOUT_MS,
          'Search'
        )
        if (!mountedRef.current) return
        const best = pickBestMatch(res.results, row.parsedYear)
        if (best) {
          updateRow(row.id, {
            results: res.results,
            selectedMovie: best,
            status: 'matched'
          })
        } else {
          updateRow(row.id, {
            results: [],
            status: 'unmatched',
            searchError: 'No results found'
          })
        }
      } catch {
        if (!mountedRef.current) return
        updateRow(row.id, {
          status: 'unmatched',
          searchError: 'Search failed'
        })
      }
    },
    [updateRow]
  )

  const ingestPaths = useCallback(
    async (paths: string[]) => {
      if (paths.length === 0) return
      // Deduplicate against rows already in the list.
      const existingPaths = new Set(rows.map((r) => r.filePath))
      const fresh = paths.filter((p) => !existingPaths.has(p))
      if (fresh.length === 0) return

      const newRows = fresh.map(buildRow)
      setRows((prev) => [...prev, ...newRows])
      await runWithConcurrency(newRows, MATCH_CONCURRENCY, autoMatchRow)
    },
    [rows, autoMatchRow]
  )

  const pickFiles = useCallback(async () => {
    const paths = await window.api.library.pickVideos()
    await ingestPaths(paths)
  }, [ingestPaths])

  const pickFolder = useCallback(async () => {
    const paths = await window.api.library.pickFolderVideos()
    if (paths.length === 0) {
      // The user might have picked an empty folder; only toast if they actually selected something.
      // We can't distinguish cancel from empty here; stay silent.
      return
    }
    await ingestPaths(paths)
  }, [ingestPaths])

  const reset = useCallback(() => {
    for (const t of debounceTimers.current.values()) clearTimeout(t)
    debounceTimers.current.clear()
    setRows([])
  }, [])

  const setQuery = useCallback(
    (rowId: string, value: string) => {
      // Schedule a debounced search using the latest row state at fire time.
      const existing = debounceTimers.current.get(rowId)
      if (existing) clearTimeout(existing)

      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? {
                ...r,
                query: value,
                searching: value.trim().length > 0,
                searchError: null,
                results: value.trim() === '' ? [] : r.results
              }
            : r
        )
      )

      const trimmed = value.trim()
      if (!trimmed) {
        debounceTimers.current.delete(rowId)
        return
      }

      const timer = setTimeout(async () => {
        debounceTimers.current.delete(rowId)
        try {
          const res = await window.api.movies.search(trimmed)
          if (!mountedRef.current) return
          updateRow(rowId, {
            results: res.results,
            searching: false,
            searchError: res.results.length === 0 ? 'No results found' : null
          })
        } catch {
          if (!mountedRef.current) return
          updateRow(rowId, {
            searching: false,
            searchError: 'Search failed'
          })
        }
      }, SEARCH_DEBOUNCE_MS)

      debounceTimers.current.set(rowId, timer)
    },
    [updateRow]
  )

  const setEditing = useCallback((rowId: string, editing: boolean) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, editing } : r)))
  }, [])

  const selectMovie = useCallback((rowId: string, item: MovieSearchItem) => {
    const t = debounceTimers.current.get(rowId)
    if (t) {
      clearTimeout(t)
      debounceTimers.current.delete(rowId)
    }
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              selectedMovie: item,
              query: item.title + (item.year ? ` (${item.year})` : ''),
              results: [],
              searching: false,
              searchError: null,
              editing: false,
              status: 'matched'
            }
          : r
      )
    )
  }, [])

  const removeRow = useCallback((rowId: string) => {
    const t = debounceTimers.current.get(rowId)
    if (t) {
      clearTimeout(t)
      debounceTimers.current.delete(rowId)
    }
    setRows((prev) => prev.filter((r) => r.id !== rowId))
  }, [])

  const commit = useCallback(async () => {
    const eligible = rows.filter((r) => r.status === 'matched' && r.selectedMovie)
    if (eligible.length === 0) return

    setIsCommitting(true)
    const added: LibraryMovie[] = []
    let failures = 0

    await runWithConcurrency(eligible, COMMIT_CONCURRENCY, async (row) => {
      updateRow(row.id, { status: 'adding' })
      try {
        const details = await window.api.movies.details(row.selectedMovie!.id)
        if (!details) throw new Error('details failed')
        const movie = await window.api.library.add({
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
          filePath: row.filePath
        })
        added.push(movie)
        updateRow(row.id, { status: 'added' })
      } catch {
        failures += 1
        updateRow(row.id, { status: 'error', errorMsg: 'Failed to add' })
      }
    })

    setIsCommitting(false)

    if (added.length > 0) {
      addToast(`Added ${added.length} movie${added.length === 1 ? '' : 's'}`, 'success')
    }
    if (failures > 0) {
      addToast(`${failures} movie${failures === 1 ? '' : 's'} failed to add`, 'error')
    }

    if (added.length > 0) onCommitted(added, failures === 0)
  }, [rows, updateRow, addToast, onCommitted])

  return {
    rows,
    isCommitting,
    pickFiles,
    pickFolder,
    reset,
    setQuery,
    setEditing,
    selectMovie,
    removeRow,
    commit
  }
}
