import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Library as LibraryIcon, Search } from 'lucide-react'
import type { LibraryMovie } from '@shared/types'
import MovieCard from '../components/movie/movie-card'
import EmptyState from '../components/ui/empty-state'
import MovieGrid from '../components/movie/movie-grid'
import AddExistingMovieModal from '../components/modal/add-existing-movie'
import LibraryTopBar from '../components/layout/library-top-bar'
import LibraryToolbar, {
  type SortOption,
  type StatusFilter
} from '../components/library/library-toolbar'
import { useAsyncAction } from '../hooks/use-async-action'
import { parseList } from '../utils/formatters'
import { sortMovies } from '../utils/sort-movies'

export default function Library() {
  const [movies, setMovies] = useState<LibraryMovie[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('added-desc')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [activeGenres, setActiveGenres] = useState<string[]>([])
  const navigate = useNavigate()
  const run = useAsyncAction()

  // Extract unique genre list from the entire library
  const allGenres = useMemo(() => {
    const set = new Set<string>()
    for (const m of movies) {
      for (const g of parseList(m.genre)) set.add(g)
    }
    return Array.from(set).sort()
  }, [movies])

  // Pipeline: search → status filter → genre filter → sort
  const filteredMovies = useMemo(() => {
    let result = movies

    // Text search
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          String(m.year).includes(q) ||
          (m.director && m.director.toLowerCase().includes(q)) ||
          (m.actors && m.actors.toLowerCase().includes(q))
      )
    }

    // Status filter
    if (statusFilter === 'downloaded') {
      result = result.filter((m) => !!m.filePath)
    } else if (statusFilter === 'not-downloaded') {
      result = result.filter((m) => !m.filePath)
    }

    // Genre filter (AND — movie must contain all selected genres)
    if (activeGenres.length > 0) {
      result = result.filter((m) => {
        const movieGenres = parseList(m.genre)
        return activeGenres.every((g) => movieGenres.includes(g))
      })
    }

    // Sort
    return sortMovies(result, sort)
  }, [movies, search, sort, statusFilter, activeGenres])

  const handleGenreToggle = useCallback((genre: string) => {
    setActiveGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setActiveGenres([])
    setStatusFilter('all')
  }, [])

  useEffect(() => {
    run(() => window.api.library.list(), 'Failed to load library').then((items) => {
      if (items) setMovies(items)
    })
  }, [run])

  return (
    <div className="p-6 pt-10">
      <LibraryTopBar
        movieCount={movies.length}
        search={search}
        onSearchChange={setSearch}
        onAddFromDevice={() => setShowAddModal(true)}
      />

      {/* Sort & Filter toolbar — only show when library has items */}
      {movies.length > 0 && (
        <LibraryToolbar
          sort={sort}
          onSortChange={setSort}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          genres={allGenres}
          activeGenres={activeGenres}
          onGenreToggle={handleGenreToggle}
          onClearAllFilters={handleClearAllFilters}
          resultCount={filteredMovies.length}
          totalCount={movies.length}
        />
      )}

      {movies.length === 0 && (
        <EmptyState
          icon={<LibraryIcon size={40} />}
          title="Your library is empty"
          subtitle="Add movies from the Discover page or download them to see them here"
          className="mt-24"
        />
      )}

      {movies.length > 0 && filteredMovies.length === 0 && (
        <EmptyState
          icon={<Search size={40} />}
          title="No results found"
          subtitle={`No movies match your current filters`}
          className="mt-24"
        />
      )}

      <MovieGrid className="mt-4">
        {filteredMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            year={movie.year}
            posterUrl={movie.posterUrl}
            rating={movie.imdbRating}
            genres={movie.genre ? movie.genre.split(',').map((g) => g.trim()) : undefined}
            runtime={movie.runtime}
            language={movie.language}
            isDownloaded={!!movie.filePath}
            onClick={() => navigate(`/library/${movie.imdbId}`)}
          />
        ))}
      </MovieGrid>

      {showAddModal && (
        <AddExistingMovieModal
          onClose={() => setShowAddModal(false)}
          onAdded={(movie) => {
            setMovies((prev) => [movie, ...prev.filter((m) => m.imdbId !== movie.imdbId)])
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}
