import { useState, useEffect, useCallback, type RefObject } from 'react'
import type { SubtitleTrack } from '@shared/types'
import {
  SUBTITLE_POSITIONS,
  SUBTITLE_FONT_SIZES,
  DEFAULT_POSITION,
  DEFAULT_FONT_SIZE,
  stepPreset
} from './subtitle-utils'
import { useOnlineSubtitles } from './use-online-subtitles'

interface UseSubtitlesOptions {
  videoRef: RefObject<HTMLVideoElement | null>
  videoSrc: string | null
  imdbId?: string
}

export function useSubtitles({ videoRef, videoSrc, imdbId }: UseSubtitlesOptions) {
  const [tracks, setTracks] = useState<SubtitleTrack[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [subtitleUrls, setSubtitleUrls] = useState<string[]>([])
  const [activeCueText, setActiveCueText] = useState<string | null>(null)
  const [bottomOffset, setBottomOffset] = useState(DEFAULT_POSITION)
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)
  const [videoFilePath, setVideoFilePath] = useState<string | null>(null)
  const [serverPort, setServerPort] = useState<number | null>(null)

  // Called when an online subtitle is downloaded — adds the track and activates it
  const handleTrackAdded = useCallback((track: SubtitleTrack, url: string) => {
    setTracks((prev) => {
      setActiveIndex(prev.length)
      return [...prev, track]
    })
    setSubtitleUrls((prev) => [...prev, url])
  }, [])

  const online = useOnlineSubtitles({
    imdbId,
    videoFilePath,
    serverPort,
    onTrackAdded: handleTrackAdded
  })

  // ── Discover subtitle files when video source changes ──────────────
  useEffect(() => {
    if (!videoSrc) return

    try {
      const url = new URL(videoSrc)
      const filePath = url.searchParams.get('path')
      const streamSessionId = url.searchParams.get('id')

      // Resolve the video file path — either directly from the URL or via streaming session
      const resolveFilePath = filePath
        ? Promise.resolve(filePath)
        : streamSessionId
          ? window.api.stream.filePath(streamSessionId)
          : Promise.resolve(null)

      resolveFilePath.then((resolvedPath) => {
        if (!resolvedPath) return

        Promise.all([
          window.api.library.resolveSubtitles(resolvedPath),
          window.api.video.serverPort()
        ]).then(([subs, port]) => {
          setTracks(subs)
          setServerPort(port)
          setVideoFilePath(resolvedPath)
          setSubtitleUrls(
            subs.map(
              (s) => `http://127.0.0.1:${port}/subtitle?path=${encodeURIComponent(s.filePath)}`
            )
          )
          setActiveIndex(null)
        })
      })
    } catch {
      console.warn('[useSubtitles] Could not parse video source URL:', videoSrc)
    }
  }, [videoSrc])

  // ── Sync active track with <video> text tracks ─────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const syncTracks = (): void => {
      const textTracks = video.textTracks
      for (let i = 0; i < textTracks.length; i++) {
        textTracks[i].mode = i === activeIndex ? 'hidden' : 'disabled'
      }
    }

    syncTracks()
    video.textTracks.addEventListener('change', syncTracks)
    video.textTracks.addEventListener('addtrack', syncTracks)
    return () => {
      video.textTracks.removeEventListener('change', syncTracks)
      video.textTracks.removeEventListener('addtrack', syncTracks)
    }
  }, [activeIndex, videoRef, tracks])

  // ── Capture active cue text for custom rendering ───────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video || activeIndex === null) {
      setActiveCueText(null)
      return
    }

    const track = video.textTracks[activeIndex]
    if (!track) {
      setActiveCueText(null)
      return
    }

    const handleCueChange = (): void => {
      const cues = track.activeCues
      if (!cues || cues.length === 0) {
        setActiveCueText(null)
        return
      }
      const texts: string[] = []
      for (let i = 0; i < cues.length; i++) {
        const cue = cues[i] as VTTCue
        if (cue.text) texts.push(cue.text)
      }
      setActiveCueText(texts.join('\n') || null)
    }

    track.addEventListener('cuechange', handleCueChange)
    handleCueChange()
    return () => {
      track.removeEventListener('cuechange', handleCueChange)
    }
  }, [activeIndex, videoRef, tracks])

  // ── Actions ────────────────────────────────────────────────────────

  const selectTrack = useCallback((index: number) => {
    setActiveIndex(index)
    setShowMenu(false)
  }, [])

  const disableSubtitles = useCallback(() => {
    setActiveIndex(null)
    setShowMenu(false)
  }, [])

  const toggleMenu = useCallback(() => {
    setShowMenu((prev) => !prev)
  }, [])

  const cycleTrack = useCallback(() => {
    setActiveIndex((prev) => {
      if (tracks.length === 0) return prev
      if (prev === null) return 0
      return prev >= tracks.length - 1 ? null : prev + 1
    })
  }, [tracks.length])

  const moveUp = useCallback(() => {
    setBottomOffset((prev) => stepPreset(SUBTITLE_POSITIONS, prev, 1))
  }, [])

  const moveDown = useCallback(() => {
    setBottomOffset((prev) => stepPreset(SUBTITLE_POSITIONS, prev, -1))
  }, [])

  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => stepPreset(SUBTITLE_FONT_SIZES, prev, 1))
  }, [])

  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => stepPreset(SUBTITLE_FONT_SIZES, prev, -1))
  }, [])

  const openOnlineSearch = useCallback(() => {
    online.openOnlineSearch()
    setShowMenu(false)
  }, [online.openOnlineSearch])

  return {
    tracks,
    activeIndex,
    subtitleUrls,
    showMenu,
    activeCueText,
    bottomOffset,
    fontSize,
    hasImdbId: !!imdbId,
    selectTrack,
    disableSubtitles,
    toggleMenu,
    cycleTrack,
    moveUp,
    moveDown,
    increaseFontSize,
    decreaseFontSize,
    online: { ...online, openOnlineSearch }
  }
}
