import { useCallback, useMemo, type Dispatch, type SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LibraryMovie } from '@shared/types'
import { useDownloadsStore } from '../stores/downloads'
import { useAsyncAction } from './use-async-action'
import { usePlayMovie } from './use-play-movie'

interface UseLibraryActionsOptions {
  movie: LibraryMovie | null
  resolvedVideo: string | null
  imdbId: string | undefined
  setMovie: Dispatch<SetStateAction<LibraryMovie | null>>
  setResolvedVideo: Dispatch<SetStateAction<string | null>>
}

export function useLibraryActions({
  movie,
  resolvedVideo,
  imdbId,
  setMovie,
  setResolvedVideo
}: UseLibraryActionsOptions) {
  const navigate = useNavigate()
  const startDownload = useDownloadsStore((s) => s.start)
  const run = useAsyncAction()

  const backTo = useMemo(() => `/library/${imdbId}`, [imdbId])

  const playMovie = usePlayMovie({
    filePath: movie?.filePath ?? null,
    resolvedVideo,
    title: movie?.title ?? '',
    imdbId: movie?.imdbId,
    backTo
  })

  const handleRemove = useCallback(
    (deleteSource: boolean) => {
      if (!movie) return
      run(() => window.api.library.remove(movie.id, deleteSource), 'Failed to remove movie', {
        onSuccess: () => navigate('/library')
      })
    },
    [movie, run, navigate]
  )

  const handleOpenFolder = useCallback(() => {
    if (!movie?.filePath) return
    run(() => window.api.library.openFolder(movie.filePath!), 'Failed to open folder')
  }, [movie?.filePath, run])

  const handlePickVideo = useCallback(async () => {
    if (!movie) return
    const picked = await run(() => window.api.library.pickVideo(), 'Failed to open file picker')
    if (!picked) return
    await run(
      () => window.api.library.setVideoPath(movie.id, picked),
      'Failed to update video path'
    )
    setMovie((prev) => (prev ? { ...prev, filePath: picked } : prev))
    setResolvedVideo(picked)
  }, [movie, run, setMovie, setResolvedVideo])

  const handleDownload = useCallback(
    async (torrent: { magnetLink: string; name: string }) => {
      if (!movie) return
      await startDownload(torrent.magnetLink, torrent.name, movie.imdbId)
    },
    [movie, startDownload]
  )

  const navigateToLibrary = useCallback(() => navigate('/library'), [navigate])

  return {
    playMovie,
    handleRemove,
    handleOpenFolder,
    handlePickVideo,
    handleDownload,
    navigateToLibrary
  }
}
