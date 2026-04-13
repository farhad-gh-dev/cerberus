import { useState, useEffect, useRef, useCallback, type RefObject } from 'react'
import { CONTROLS_HIDE_DELAY } from '../../utils/constants'

interface VideoControlsDeps {
  videoRef: RefObject<HTMLVideoElement | null>
  playing: boolean
  isSeeking: boolean
  isDraggingVolume: boolean
  showSpeedMenu: boolean
  showSubtitleMenu: boolean
}

export function useVideoControls({
  videoRef,
  playing,
  isSeeking,
  isDraggingVolume,
  showSpeedMenu,
  showSubtitleMenu
}: VideoControlsDeps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    if (playing && !isSeeking && !isDraggingVolume && !showSpeedMenu && !showSubtitleMenu) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), CONTROLS_HIDE_DELAY)
    }
  }, [playing, isSeeking, isDraggingVolume, showSpeedMenu, showSubtitleMenu])

  useEffect(() => {
    resetControlsTimer()
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    }
  }, [playing, resetControlsTimer])

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }, [])

  useEffect(() => {
    const handler = (): void => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // PiP
  const togglePip = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else {
      await video.requestPictureInPicture()
    }
  }, [videoRef])

  return {
    containerRef,
    showControls,
    isFullscreen,
    toggleFullscreen,
    togglePip,
    resetControlsTimer
  }
}
