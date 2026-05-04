import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { LibraryMovie } from '@shared/types'
import MovieSearchResultItem from '../../movie/movie-search-result-item'
import { useAddExistingMovie } from '../../../hooks/use-add-existing-movie'
import SearchBar from '../../ui/search-bar'
import DropZone from './drop-zone'
import FileRow from './file-row'
import SelectedMovie from './selected-movie'

interface AddExistingMovieModalProps {
  onClose: () => void
  onAdded: (movie: LibraryMovie) => void
}

export default function AddExistingMovieModal({ onClose, onAdded }: AddExistingMovieModalProps) {
  const {
    filePath,
    query,
    results,
    searching,
    searchError,
    selectedMovie,
    addingId,
    isIdle,
    pickFile,
    clearFile,
    clearSelectedMovie,
    handleQueryChange,
    selectMovie,
    submitMovie
  } = useAddExistingMovie(onAdded)

  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!selectedMovie && filePath) {
      searchInputRef.current?.focus()
    }
  }, [selectedMovie, filePath])

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
        className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl dark:ring-2 dark:ring-white/8 bg-custom-100 dark:bg-custom-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <h2 className="text-lg font-semibold text-custom-800 dark:text-custom-50">
            Add movie from device
          </h2>
          <button
            onClick={onClose}
            disabled={!isIdle}
            className="flex h-8 w-8 items-center justify-center rounded-full text-custom-500 transition-colors bg-custom-50 dark:bg-transparent hover:text-custom-800 disabled:opacity-40 dark:hover:bg-custom-700 dark:hover:text-custom-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-2 pb-3 flex flex-col gap-3">
          {filePath ? (
            <FileRow filePath={filePath} onClear={clearFile} />
          ) : (
            <DropZone onPickFile={pickFile} />
          )}

          {/* Search & select movie */}
          {filePath && (
            <div className="relative">
              {selectedMovie ? (
                <SelectedMovie movie={selectedMovie} onChange={clearSelectedMovie} />
              ) : (
                <>
                  <SearchBar
                    inputRef={searchInputRef}
                    value={query}
                    onChange={handleQueryChange}
                    onReset={() => handleQueryChange('')}
                    placeholder="Search by movie title..."
                    isLoading={searching}
                    className="w-full xl:w-full"
                  />

                  {/* Dropdown results */}
                  {query.trim() && (searching || results.length > 0 || searchError) && (
                    <div className="absolute z-50 left-0 right-0 mt-1.5 min-w-[230px] overflow-hidden rounded-xl bg-custom-50 p-1.5 shadow-lg dark:bg-custom-800 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_10px_rgba(0,0,0,0.2)]">
                      {searchError && (
                        <p className="px-3 py-4 text-center text-sm text-custom-500 dark:text-custom-400">
                          {searchError}
                        </p>
                      )}

                      {!searching && results.length > 0 && (
                        <div className="max-h-[40vh] overflow-y-auto space-y-1">
                          {results.map((item) => (
                            <MovieSearchResultItem
                              key={item.id}
                              item={item}
                              onSelect={selectMovie}
                              variant="dropdown"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 pt-4 pb-5">
          <button
            onClick={submitMovie}
            disabled={!selectedMovie || !filePath || addingId !== null}
            className="flex items-center gap-2 rounded-xl bg-custom-800 px-5 py-2.5 text-sm font-medium text-custom-50 transition-colors hover:bg-custom-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-custom-50 dark:text-custom-800 dark:hover:bg-custom-200"
          >
            {addingId !== null && (
              <div className="h-4 w-4 rounded-full border-2 border-custom-50/30 border-t-custom-50 animate-spin dark:border-custom-800/30 dark:border-t-custom-800" />
            )}
            Add to Library
          </button>
        </div>
      </div>
    </div>
  )
}
