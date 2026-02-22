import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Library as LibraryIcon, Plus, Search } from 'lucide-react'
import type { LibraryMovie } from '@shared/types'
import MovieCard from '../components/movie-card'
import EmptyState from '../components/empty-state'
import MovieGrid from '../components/movie-grid'
import AddExistingMovieModal from '../components/add-existing-movie-modal'
import { useAsyncAction } from '../hooks/use-async-action'

export default function Library() {
  const [movies, setMovies] = useState<LibraryMovie[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const run = useAsyncAction()

  const filteredMovies = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return movies
    return movies.filter((m) => m.title.toLowerCase().includes(q) || String(m.year).includes(q))
  }, [movies, search])

  useEffect(() => {
    run(() => window.api.library.list(), 'Failed to load library').then((items) => {
      if (items) setMovies(items)
    })
  }, [run])

  return (
    <div className="p-6 pt-10 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Library</h1>
          <p className="text-zinc-500 text-sm mt-1">{movies.length} movies</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border border-zinc-700 text-white text-sm rounded-xl pl-4 pr-9 py-2 w-56 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:shadow-[0_0_8px_rgba(255,255,255,0.15)] transition-all"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add From Your Device
          </button>
        </div>
      </div>

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
          subtitle={`No movies match "${search}"`}
          className="mt-24"
        />
      )}

      <MovieGrid className="mt-6">
        {filteredMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            year={movie.year}
            posterUrl={movie.posterUrl}
            rating={movie.imdbRating}
            status={movie.filePath ? 'downloaded' : 'none'}
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
