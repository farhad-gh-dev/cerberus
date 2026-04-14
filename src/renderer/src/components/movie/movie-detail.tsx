import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, AlertCircle } from 'lucide-react'
import type { TorrentResult } from '@shared/types'
import TorrentResults from './torrent-results'
import { useDownloadsStore } from '../../stores/downloads'
import { usePlayMovie } from '../../hooks/use-play-movie'
import { useMovieDetail } from '../../hooks/use-movie-detail'
import LoadingSpinner from '../ui/loading-spinner'
import EmptyState from '../ui/empty-state'
import MovieDetailLayout from './movie-detail-layout'
import MovieMeta from './movie-meta'
import MovieActions from './movie-actions'
import MovieSidePanel from './movie-side-panel'

interface MovieDetailProps {
  tmdbId: number
  imdbId?: string
  onClose: () => void
}

export default function MovieDetail({ tmdbId, imdbId: imdbIdProp, onClose }: MovieDetailProps) {
  const navigate = useNavigate()
  const startDownload = useDownloadsStore((s) => s.start)
  const [showTorrents, setShowTorrents] = useState(false)
  const [streamMode, setStreamMode] = useState(false)

  const {
    movie,
    loading,
    heroImage,
    backdropLoading,
    libraryEntry,
    resolvedVideo,
    addingToLibrary,
    genres,
    cast,
    directors,
    writers,
    addToLibrary
  } = useMovieDetail({ tmdbId, imdbId: imdbIdProp })

  const playMovie = usePlayMovie({
    filePath: libraryEntry?.filePath ?? null,
    resolvedVideo,
    title: movie?.title ?? '',
    imdbId: movie?.imdbId,
    backTo: '/',
    beforeNavigate: onClose
  })

  const handleDownload = useCallback(
    async (torrent: TorrentResult) => {
      if (!movie) return
      await startDownload(torrent.magnetLink, torrent.name, movie.imdbId)
      setShowTorrents(false)
    },
    [movie, startDownload]
  )

  const openTorrents = useCallback(() => {
    setStreamMode(false)
    setShowTorrents(true)
  }, [])
  const openStream = useCallback(() => {
    setStreamMode(true)
    setShowTorrents(true)
  }, [])
  const closeTorrents = useCallback(() => {
    setShowTorrents(false)
    setStreamMode(false)
  }, [])

  const handleStreamTorrent = useCallback(
    async (torrent: TorrentResult) => {
      if (!movie) return
      const result = await window.api.stream.start(torrent.magnetLink)
      setShowTorrents(false)
      setStreamMode(false)
      const params = new URLSearchParams({
        streamId: result.id,
        title: movie.title,
        back: '/'
      })
      if (movie.imdbId) params.set('imdbId', movie.imdbId)
      onClose()
      navigate(`/player?${params.toString()}`)
    },
    [movie, onClose, navigate]
  )

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80">
        <LoadingSpinner className="h-full" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <EmptyState
          icon={<AlertCircle size={48} className="text-red-400" />}
          title="Movie not found"
          className="text-zinc-400"
          action={
            <button
              onClick={onClose}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Close
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black" onClick={onClose}>
      <div className="h-full w-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <MovieDetailLayout
          heroImage={heroImage}
          backdropLoading={backdropLoading}
          title={movie.title}
          genres={genres}
          plot={movie.plot}
          navButton={
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <X size={20} />
            </button>
          }
          meta={<MovieMeta movie={movie} />}
          actions={
            <MovieActions
              hasFile={!!libraryEntry?.filePath}
              inLibrary={!!libraryEntry}
              addingToLibrary={addingToLibrary}
              playDisabled={resolvedVideo === null}
              onPlay={playMovie}
              onFindTorrents={openTorrents}
              onAddToLibrary={addToLibrary}
              onStream={openStream}
            />
          }
          sidePanel={
            <MovieSidePanel movie={movie} cast={cast} directors={directors} writers={writers} />
          }
        />
      </div>

      {showTorrents && (
        <TorrentResults
          movieTitle={movie.title}
          movieYear={movie.year}
          imdbId={movie.imdbId}
          onClose={closeTorrents}
          onDownload={streamMode ? handleStreamTorrent : handleDownload}
          streamMode={streamMode}
        />
      )}
    </div>
  )
}
