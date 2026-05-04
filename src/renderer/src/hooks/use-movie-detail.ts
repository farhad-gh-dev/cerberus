import { useState, useEffect, useCallback, useMemo } from 'react'
import type { MovieDetail, LibraryMovie } from '@shared/types'
import { useAsyncAction } from './use-async-action'
import { parseList, getHeroImage } from '../utils/formatters'

interface UseMovieDetailOptions {
  tmdbId: number
  imdbId?: string
}

interface MovieDetailState {
  movie: MovieDetail | null
  loading: boolean
  heroImage: string | null
  backdropLoading: boolean
  libraryEntry: LibraryMovie | null
  resolvedVideo: string | null
  addingToLibrary: boolean
  genres: string[]
  cast: string[]
  directors: string[]
  writers: string[]
}

interface UseMovieDetailReturn extends MovieDetailState {
  addToLibrary: () => Promise<void>
}

export function useMovieDetail({
  tmdbId,
  imdbId: imdbIdProp
}: UseMovieDetailOptions): UseMovieDetailReturn {
  const run = useAsyncAction()

  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [backdrop, setBackdrop] = useState<string | null>(null)
  const [backdropLoading, setBackdropLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [libraryEntry, setLibraryEntry] = useState<LibraryMovie | null>(null)
  const [addingToLibrary, setAddingToLibrary] = useState(false)
  const [resolvedVideo, setResolvedVideo] = useState<string | null>(null)

  // ── Fetch movie details + backdrop ──────────────────────────────────
  useEffect(() => {
    let stale = false

    setLoading(true)
    setMovie(null)
    setBackdrop(null)
    setBackdropLoading(true)
    setLibraryEntry(null)
    setResolvedVideo(null)

    const detailsPromise = run(
      () => window.api.movies.details(tmdbId),
      'Failed to load movie details'
    ).then((data) => {
      if (stale || !data) return
      setMovie(data)

      if (data.backdropUrl) {
        setBackdrop(data.backdropUrl)
        setBackdropLoading(false)
      }

      const movieImdbId = data.imdbId || imdbIdProp
      if (movieImdbId) {
        window.api.library
          .get(movieImdbId)
          .then((entry) => {
            if (!stale) setLibraryEntry(entry)
          })
          .catch(() => {})
      }
    })

    const backdropPromise = imdbIdProp
      ? window.api.tmdb
          .backdrop(imdbIdProp)
          .then((tmdb) => {
            if (!stale && tmdb.backdrop) setBackdrop(tmdb.backdrop)
          })
          .catch(() => {})
          .finally(() => {
            if (!stale) setBackdropLoading(false)
          })
      : Promise.resolve().then(() => {
          if (!stale) setBackdropLoading(false)
        })

    Promise.allSettled([detailsPromise, backdropPromise]).finally(() => {
      if (!stale) setLoading(false)
    })

    return () => {
      stale = true
    }
  }, [tmdbId, imdbIdProp, run])

  // ── Resolve video file once library entry is available ─────────────
  useEffect(() => {
    if (!libraryEntry?.filePath) return
    let stale = false

    window.api.library
      .resolveVideo(libraryEntry.filePath, libraryEntry.title, libraryEntry.year)
      .then((resolved) => {
        if (!stale) setResolvedVideo(resolved)
      })
      .catch(() => {})

    return () => {
      stale = true
    }
  }, [libraryEntry])

  const addToLibrary = useCallback(async () => {
    if (!movie || libraryEntry) return
    setAddingToLibrary(true)
    try {
      const entry = await run(
        () =>
          window.api.library.add({
            imdbId: movie.imdbId,
            title: movie.title,
            year: movie.year,
            posterUrl: movie.posterUrl,
            plot: movie.plot,
            genre: movie.genre,
            director: movie.director,
            actors: movie.actors,
            imdbRating: movie.rating,
            runtime: movie.runtime,
            language: movie.language
          }),
        'Failed to add to library'
      )
      if (entry) setLibraryEntry(entry)
    } finally {
      setAddingToLibrary(false)
    }
  }, [movie, libraryEntry, run])

  const genres = useMemo(() => parseList(movie?.genre), [movie?.genre])
  const cast = useMemo(() => parseList(movie?.actors), [movie?.actors])
  const directors = useMemo(() => parseList(movie?.director), [movie?.director])
  const writers = useMemo(() => parseList(movie?.writer), [movie?.writer])
  const heroImage = useMemo(
    () => getHeroImage(backdrop, movie?.posterUrl, backdropLoading),
    [backdrop, movie?.posterUrl, backdropLoading]
  )

  return {
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
  }
}
