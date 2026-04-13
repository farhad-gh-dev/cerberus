import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncAction } from './use-async-action'

interface PlayMovieOptions {
  filePath: string | null
  resolvedVideo: string | null
  title: string
  imdbId?: string
  backTo: string
  /** Called right before navigating to the internal player (e.g. to close a modal). */
  beforeNavigate?: () => void
}

/**
 * If an external player is configured, open the file with it.
 * Otherwise navigate to the built-in player page.
 */
export function usePlayMovie({
  filePath,
  resolvedVideo,
  title,
  imdbId,
  backTo,
  beforeNavigate
}: PlayMovieOptions) {
  const navigate = useNavigate()
  const run = useAsyncAction()

  const play = useCallback(async () => {
    const file = resolvedVideo || filePath
    if (!file) return
    try {
      const settings = await window.api.settings.getAll()
      if (settings && settings.externalPlayerPath) {
        await run(() => window.api.library.openFile(file), 'Failed to open external player')
        return
      }
    } catch {
      // ignore and fallback to internal player
    }
    const params = new URLSearchParams({ file, title, back: backTo })
    if (imdbId) params.set('imdbId', imdbId)
    beforeNavigate?.()
    navigate(`/player?${params.toString()}`)
  }, [filePath, resolvedVideo, title, imdbId, backTo, beforeNavigate, navigate, run])

  return play
}
