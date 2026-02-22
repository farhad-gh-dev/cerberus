import { useEffect } from 'react'
import { X, FileVideo, Search, Check } from 'lucide-react'
import type { LibraryMovie } from '@shared/types'
import LoadingSpinner from './loading-spinner'
import MovieSearchResultItem from './movie-search-result-item'
import { useAddExistingMovie } from '../hooks/use-add-existing-movie'

interface AddExistingMovieModalProps {
  onClose: () => void
  onAdded: (movie: LibraryMovie) => void
}

export default function AddExistingMovieModal({ onClose, onAdded }: AddExistingMovieModalProps) {
  const {
    filePath,
    query,
    setQuery,
    results,
    searching,
    searchError,
    addingId,
    isIdle,
    pickFile,
    search,
    addMovie
  } = useAddExistingMovie(onAdded)

  // Close on Escape key (only when no async operation is in flight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isIdle) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isIdle, onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={isIdle ? onClose : undefined}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Add Existing Movie</h2>
          <button
            onClick={onClose}
            disabled={!isIdle}
            className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Step 1: Pick file */}
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">
              1. Select video file
            </label>
            <button
              onClick={pickFile}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
                filePath
                  ? 'border-green-500/30 bg-green-500/5 text-green-400'
                  : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              <FileVideo size={18} className="shrink-0" />
              {filePath ? (
                <span className="text-sm truncate">{filePath}</span>
              ) : (
                <span className="text-sm">Choose a video file from your computer...</span>
              )}
              {filePath && <Check size={16} className="ml-auto shrink-0 text-green-400" />}
            </button>
          </div>

          {/* Step 2: Search movie */}
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">
              2. Search for the movie
            </label>
            <form onSubmit={search} className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5">
                <Search size={16} className="text-zinc-500 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by movie title..."
                  className="bg-transparent outline-none text-sm text-white placeholder-zinc-500 w-full"
                  disabled={!filePath}
                />
              </div>
              <button
                type="submit"
                disabled={!filePath || !query.trim() || searching}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Results */}
          {searching && <LoadingSpinner className="py-8" />}

          {searchError && <p className="text-zinc-500 text-sm text-center py-4">{searchError}</p>}

          {!searching && results.length > 0 && (
            <div>
              <label className="text-sm font-medium text-zinc-400 mb-2 block">
                3. Select the matching movie
              </label>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {results.map((item) => (
                  <MovieSearchResultItem
                    key={item.id}
                    item={item}
                    isAdding={addingId === item.id}
                    disabled={addingId !== null}
                    onAdd={addMovie}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
