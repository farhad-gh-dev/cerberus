import { useRef, useCallback } from 'react'
import MovieCard from '../components/movie/movie-card'
import MovieDetail from '../components/movie/movie-detail'
import PageLoader from '../components/ui/loading-spinner'
import MovieGrid from '../components/movie/movie-grid'
import ApiKeyWarning from '../components/ui/api-key-warning'
import HomeTopBar from '../components/layout/home-top-bar'
import { useHome } from '../hooks/use-home'

export default function Home() {
  const {
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
            loadMore()
          }
        },
        { root, rootMargin: '400px' }
      )
      observerRef.current.observe(node)
    },
    [loadMore]
  )

  return (
    <div className="p-6 pt-10">
      {!hasApiKey && <ApiKeyWarning />}

      {/* Top bar: title / category tabs / search */}
      <HomeTopBar
        category={category}
        isSearching={search.searched}
        onCategoryChange={changeCategory}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Loading state */}
      {search.loading && <PageLoader className="mt-20" />}

      {/* Search Results */}
      {!search.loading && search.searched && search.results.length > 0 && (
        <MovieGrid className="mt-8">
          {search.results.map((movie) => {
            const imdbId = movie.enrichment.imdbId
            const libraryEntry =
              (imdbId ? getLibraryEntry(imdbId) : undefined) ??
              getLibraryEntryByTitleYear(movie.title, movie.year)
            return (
              <MovieCard
                key={movie.id}
                title={movie.title}
                year={movie.year}
                posterUrl={movie.posterUrl}
                rating={movie.rating}
                genres={movie.genres}
                language={movie.language}
                runtime={movie.enrichment.runtime}
                isInLibrary={!!libraryEntry}
                isDownloaded={!!libraryEntry?.filePath}
                onClick={() => selectMovie(movie.id, imdbId)}
              />
            )
          })}
        </MovieGrid>
      )}

      {/* Empty / error state */}
      {!search.loading && search.searched && search.results.length === 0 && (
        <p className="text-custom-500 dark:text-custom-400 text-center mt-12">
          {search.error || 'No movies found'}
        </p>
      )}

      {/* Category section — shown when no search is active */}
      {!search.searched && (
        <div className="mt-6 xl:mt-8">
          {categoryState.loading && <PageLoader className="mt-12" />}

          {!categoryState.loading && categoryState.movies.length > 0 && (
            <MovieGrid>
              {categoryState.movies.map((movie) => {
                const imdbId = movie.enrichment.imdbId ?? movie.imdbId
                const libraryEntry = getLibraryEntry(imdbId)
                return (
                  <MovieCard
                    key={movie.tmdbId}
                    title={movie.title}
                    year={movie.year}
                    posterUrl={movie.posterUrl}
                    rating={movie.rating}
                    genres={movie.genres}
                    language={movie.originalLanguage}
                    runtime={movie.enrichment.runtime || movie.runtime}
                    isInLibrary={!!libraryEntry}
                    isDownloaded={!!libraryEntry?.filePath}
                    onClick={() => selectMovie(movie.tmdbId, imdbId)}
                  />
                )
              })}
            </MovieGrid>
          )}

          {!categoryState.loading && categoryState.movies.length === 0 && (
            <p className="text-custom-500 dark:text-custom-400 text-sm">Could not load movies.</p>
          )}

          {/* Infinite scroll sentinel */}
          {categoryState.loadingMore && <PageLoader className="mt-8" />}
          {categoryState.hasMore && !categoryState.loading && (
            <div ref={sentinelRef} className="h-4" />
          )}
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
