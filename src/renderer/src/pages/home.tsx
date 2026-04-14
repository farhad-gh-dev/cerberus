import { useRef, useCallback } from 'react'
import SearchBar from '../components/ui/search-bar'
import MovieCard from '../components/movie/movie-card'
import MovieDetail from '../components/movie/movie-detail'
import LoadingSpinner from '../components/ui/loading-spinner'
import MovieGrid from '../components/movie/movie-grid'
import ApiKeyWarning from '../components/ui/api-key-warning'
import { TrendingUp } from 'lucide-react'
import { useHome } from '../hooks/use-home'

export default function Home() {
  const {
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
  } = useHome()

  const observerRef = useRef<IntersectionObserver | null>(null)

  // Callback ref: fires whenever the sentinel <div> mounts or unmounts
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Tear down previous observer
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      if (!node) return

      const root = document.querySelector('main')
      if (!root) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreTrending()
          }
        },
        { root, rootMargin: '400px' }
      )
      observerRef.current.observe(node)
    },
    [loadMoreTrending]
  )

  return (
    <div className="p-6 pt-10">
      <h1 className="text-3xl font-bold text-white mb-6">Discover movies</h1>

      {!hasApiKey && <ApiKeyWarning />}

      {/* Header with Trending title and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Trending this week</h2>
        </div>
        <div>
          <SearchBar onSearch={handleSearch} onReset={handleReset} />
        </div>
      </div>

      {/* Loading state */}
      {search.loading && <LoadingSpinner className="mt-20" />}

      {/* Search Results */}
      {!search.loading && search.searched && search.results.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-white mt-8 mb-4">Search results</h2>
          <MovieGrid>
            {search.results.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                year={movie.year}
                posterUrl={movie.posterUrl}
                status={getCardStatus(null)} // MovieSearchItem lacks imdbId
                onClick={() => selectMovie(movie.id)}
              />
            ))}
          </MovieGrid>
        </>
      )}

      {/* Empty / error state */}
      {!search.loading && search.searched && search.results.length === 0 && (
        <p className="text-zinc-500 text-center mt-12">{search.error || 'No movies found'}</p>
      )}

      {/* Trending section — shown when no search is active */}
      {!search.searched && (
        <div className="mt-8">
          {trending.loading && <LoadingSpinner className="mt-12" />}

          {!trending.loading && trending.movies.length > 0 && (
            <MovieGrid>
              {trending.movies.map((movie) => (
                <MovieCard
                  key={movie.tmdbId}
                  title={movie.title}
                  year={movie.year}
                  posterUrl={movie.posterUrl}
                  rating={movie.rating}
                  status={getCardStatus(movie.imdbId)}
                  onClick={movie.imdbId ? () => selectMovie(movie.tmdbId, movie.imdbId) : undefined}
                />
              ))}
            </MovieGrid>
          )}

          {!trending.loading && trending.movies.length === 0 && (
            <p className="text-zinc-500 text-sm">Could not load trending movies.</p>
          )}

          {/* Infinite scroll sentinel */}
          {trending.loadingMore && <LoadingSpinner className="mt-8" />}
          {trending.hasMore && !trending.loading && <div ref={sentinelRef} className="h-4" />}
        </div>
      )}

      {/* Detail modal */}
      {selectedMovie && (
        <MovieDetail
          tmdbId={selectedMovie.tmdbId}
          imdbId={selectedMovie.imdbId}
          onClose={clearSelection}
        />
      )}
    </div>
  )
}
