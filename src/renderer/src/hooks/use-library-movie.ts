import { useState, useEffect, useMemo } from 'react'
import type { LibraryMovie } from '@shared/types'
import { useAsyncAction } from './use-async-action'
import { parseList, getHeroImage } from '../utils/formatters'

export function useLibraryMovie(imdbId: string | undefined) {
  const run = useAsyncAction()

  const [movie, setMovie] = useState<LibraryMovie | null>(null)
  const [backdrop, setBackdrop] = useState<string | null>(null)
  const [backdropLoading, setBackdropLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [resolvedVideo, setResolvedVideo] = useState<string | null>(null)

  useEffect(() => {
    if (!imdbId) return
    let stale = false

    setLoading(true)
    setBackdrop(null)
    setBackdropLoading(true)
    setResolvedVideo(null)

    run(() => window.api.library.get(imdbId), 'Failed to load movie')
      .then((data) => {
        if (!stale && data) setMovie(data)
      })
      .finally(() => {
        if (!stale) setLoading(false)
      })

    window.api.tmdb
      .backdrop(imdbId)
      .then((tmdb) => {
        if (!stale) setBackdrop(tmdb.backdrop)
      })
      .catch(() => {})
      .finally(() => {
        if (!stale) setBackdropLoading(false)
      })

    return () => {
      stale = true
    }
  }, [imdbId, run])

  useEffect(() => {
    if (!movie?.filePath) return
    let stale = false

    window.api.library
      .resolveVideo(movie.filePath, movie.title, movie.year)
      .then((resolved) => {
        if (!stale) setResolvedVideo(resolved)
      })
      .catch(() => {})

    return () => {
      stale = true
    }
  }, [movie?.filePath, movie?.title, movie?.year])

  const heroImage = useMemo(
    () => getHeroImage(backdrop, movie?.posterUrl, backdropLoading),
    [backdrop, movie?.posterUrl, backdropLoading]
  )
  const genres = useMemo(() => parseList(movie?.genre), [movie?.genre])
  const hasFile = !!movie?.filePath

  return {
    movie,
    setMovie,
    loading,
    heroImage,
    backdropLoading,
    resolvedVideo,
    setResolvedVideo,
    genres,
    hasFile
  }
}
