import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncAction } from './use-async-action'

interface StreamMovieOptions {
  title: string
  back: string
  imdbId?: string
  beforeNavigate?: () => void
}

export function useStreamMovie({ title, back, imdbId, beforeNavigate }: StreamMovieOptions) {
  const navigate = useNavigate()
  const run = useAsyncAction()

  return useCallback(
    async (magnetLink: string) => {
      const started = await run(
        () => window.api.stream.start(magnetLink),
        'Failed to start streaming'
      )
      if (!started) return

      try {
        const settings = await window.api.settings.getAll()
        if (settings?.externalPlayerEnabled && settings?.externalPlayerPath) {
          const result = await window.api.stream.openExternal(started.id)
          if (result.ok) {
            beforeNavigate?.()
            return
          }
          // External launch failed — fall through to in-app player.
        }
      } catch {
        /* settings unreachable; fall through to in-app player */
      }

      const params = new URLSearchParams({
        streamId: started.id,
        title: title || started.fileName,
        back
      })
      if (imdbId) params.set('imdbId', imdbId)
      beforeNavigate?.()
      navigate(`/player?${params.toString()}`)
    },
    [run, title, back, imdbId, beforeNavigate, navigate]
  )
}
