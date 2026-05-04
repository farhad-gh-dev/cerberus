import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Film } from 'lucide-react'
import TorrentResults from '../components/movie/torrent-results'
import { useStreamMovie } from '../hooks/use-stream-movie'
import ConfirmRemoveModal from '../components/modal/confirm-remove-modal'
import PageLoader from '../components/ui/loading-spinner'
import EmptyState from '../components/ui/empty-state'
import MovieDetailLayout from '../components/movie/movie-detail-layout'
import LibraryMeta from '../components/library/library-meta'
import LibraryActions from '../components/library/library-actions'
import LibrarySidePanel from '../components/library/library-side-panel'
import LibraryFooter from '../components/library/library-footer'
import { useLibraryMovie } from '../hooks/use-library-movie'
import { useLibraryActions } from '../hooks/use-library-actions'
import { isValidField } from '../utils/formatters'

export default function LibraryDetail() {
  const { imdbId } = useParams<{ imdbId: string }>()
  const [showTorrents, setShowTorrents] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [streamMode, setStreamMode] = useState(false)

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

  const closeStreamOverlays = useCallback(() => {
    setShowTorrents(false)
    setStreamMode(false)
  }, [])

  const streamMovie = useStreamMovie({
    title: movie?.title ?? '',
    back: movie ? `/library/${movie.imdbId}` : '/library',
    imdbId: movie?.imdbId,
    beforeNavigate: closeStreamOverlays
  })

  const handleStreamTorrent = useCallback(
    async (torrent: { magnetLink: string }) => {
      if (!movie) return
      await streamMovie(torrent.magnetLink)
    },
    [movie, streamMovie]
  )

  const openStream = useCallback(() => {
    setStreamMode(true)
    setShowTorrents(true)
  }, [])

  if (loading) return <PageLoader className="h-full" />

  if (!movie) {
    return (
      <EmptyState
        icon={<Film size={48} />}
        title="Movie not found"
        className="h-full"
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
    <div className="fixed inset-0 z-40 bg-black overflow-y-auto">
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
            onFindTorrents={() => {
              setStreamMode(false)
              setShowTorrents(true)
            }}
            onRemove={() => setShowRemoveModal(true)}
            onStream={openStream}
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
          onConfirm={(del) => {
            setShowRemoveModal(false)
            handleRemove(del)
          }}
          onCancel={() => setShowRemoveModal(false)}
        />
      )}

      {showTorrents && (
        <TorrentResults
          movieTitle={movie.title}
          movieYear={movie.year}
          imdbId={movie.imdbId}
          onClose={() => {
            setShowTorrents(false)
            setStreamMode(false)
          }}
          onDownload={
            streamMode
              ? handleStreamTorrent
              : async (t) => {
                  await handleDownload(t)
                  setShowTorrents(false)
                }
          }
          streamMode={streamMode}
        />
      )}
    </div>
  )
}
