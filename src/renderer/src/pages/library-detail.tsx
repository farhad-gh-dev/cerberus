import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Film } from 'lucide-react'
import TorrentResults from '../components/torrent-results'
import ConfirmRemoveModal from '../components/confirm-remove-modal'
import LoadingSpinner from '../components/loading-spinner'
import EmptyState from '../components/empty-state'
import MovieDetailLayout from '../components/movie-detail-layout'
import LibraryMeta from '../components/library-meta'
import LibraryActions from '../components/library-actions'
import LibrarySidePanel from '../components/library-side-panel'
import LibraryFooter from '../components/library-footer'
import { useLibraryMovie } from '../hooks/use-library-movie'
import { useLibraryActions } from '../hooks/use-library-actions'
import { isValidField } from '../utils/formatters'

export default function LibraryDetail() {
  const { imdbId } = useParams<{ imdbId: string }>()
  const [showTorrents, setShowTorrents] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)

  const {
    movie,
    setMovie,
    loading,
    heroImage,
    backdropLoading,
    resolvedVideo,
    setResolvedVideo,
    genres,
    hasFile
  } = useLibraryMovie(imdbId)

  const {
    playMovie,
    handleRemove,
    handleOpenFolder,
    handlePickVideo,
    handleDownload,
    navigateToLibrary
  } = useLibraryActions({ movie, resolvedVideo, imdbId, setMovie, setResolvedVideo })

  if (loading) return <LoadingSpinner className="h-full" />

  if (!movie) {
    return (
      <EmptyState
        icon={<Film size={48} />}
        title="Movie not found"
        className="h-full text-zinc-500"
        action={
          <button
            onClick={navigateToLibrary}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Back to Library
          </button>
        }
      />
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <MovieDetailLayout
        heroImage={heroImage}
        backdropLoading={backdropLoading}
        title={movie.title}
        genres={genres}
        plot={isValidField(movie.plot) ? movie.plot : undefined}
        navButton={
          <button
            onClick={navigateToLibrary}
            className="absolute top-10 left-6 z-50 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Library
          </button>
        }
        meta={<LibraryMeta movie={movie} />}
        actions={
          <LibraryActions
            hasFile={hasFile}
            playDisabled={resolvedVideo === null}
            onPlay={playMovie}
            onOpenFolder={handleOpenFolder}
            onFindTorrents={() => setShowTorrents(true)}
            onRemove={() => setShowRemoveModal(true)}
          />
        }
        footer={
          <LibraryFooter
            hasFile={hasFile}
            resolvedVideo={resolvedVideo}
            filePath={movie.filePath}
            onPickVideo={handlePickVideo}
          />
        }
        sidePanel={<LibrarySidePanel movie={movie} />}
      />

      {showRemoveModal && (
        <ConfirmRemoveModal
          movieTitle={movie.title}
          filePath={movie.filePath}
          onConfirm={(del, rem) => {
            setShowRemoveModal(false)
            handleRemove(del, rem)
          }}
          onCancel={() => setShowRemoveModal(false)}
        />
      )}

      {showTorrents && (
        <TorrentResults
          movieTitle={movie.title}
          movieYear={movie.year}
          imdbId={movie.imdbId}
          onClose={() => setShowTorrents(false)}
          onDownload={async (t) => {
            await handleDownload(t)
            setShowTorrents(false)
          }}
        />
      )}
    </div>
  )
}
