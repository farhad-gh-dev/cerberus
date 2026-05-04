import { useEffect } from 'react'
import { VOLUME_STEP, FRAME_DURATION } from '../../utils/constants'

interface KeyboardShortcutDeps {
  togglePlay: () => void
  skip: (seconds: number) => void
  toggleFullscreen: () => void
  toggleMute: () => void
  adjustVolume: (delta: number) => void
  resetControlsTimer: () => void
  navigate: (path: string) => void
  backTo: string
  isFullscreen: boolean
  showSpeedMenu: boolean
  setShowSpeedMenu: (show: boolean) => void
  videoRef: React.RefObject<HTMLVideoElement | null>
  cycleSubtitleTrack: () => void
  locked: boolean
}

export function useKeyboardShortcuts({
  togglePlay,
  skip,
  toggleFullscreen,
  toggleMute,
  adjustVolume,
  resetControlsTimer,
  navigate,
  backTo,
  isFullscreen,
  showSpeedMenu,
  setShowSpeedMenu,
  videoRef,
  cycleSubtitleTrack,
  locked
}: KeyboardShortcutDeps) {
  useEffect(() => {
    const lockedAllowed = new Set([
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'j',
      'l',
      'f'
    ])

    const handleKey = (e: KeyboardEvent): void => {
      const video = videoRef.current
      if (!video) return
      if (locked && !lockedAllowed.has(e.key)) return

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          resetControlsTimer()
          break
        case 'ArrowLeft':
        case 'j':
          e.preventDefault()
          skip(-10)
          resetControlsTimer()
          break
        case 'ArrowRight':
        case 'l':
          e.preventDefault()
          skip(10)
          resetControlsTimer()
          break
        case 'ArrowUp':
          e.preventDefault()
          adjustVolume(VOLUME_STEP)
          resetControlsTimer()
          break
        case 'ArrowDown':
          e.preventDefault()
          adjustVolume(-VOLUME_STEP)
          resetControlsTimer()
          break
        case 'm':
          toggleMute()
          resetControlsTimer()
          break
        case 'f':
          toggleFullscreen()
          break
        case 'Escape':
          if (showSpeedMenu) {
            setShowSpeedMenu(false)
          } else if (isFullscreen) {
            document.exitFullscreen()
          } else {
            navigate(backTo)
          }
          break
        case ',':
          if (video.paused) {
            video.currentTime = Math.max(0, video.currentTime - FRAME_DURATION)
          }
          break
        case '.':
          if (video.paused) {
            video.currentTime = Math.min(video.duration, video.currentTime + FRAME_DURATION)
          }
          break
        case 'c':
          cycleSubtitleTrack()
          resetControlsTimer()
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [
    togglePlay,
    skip,
    toggleFullscreen,
    toggleMute,
    adjustVolume,
    resetControlsTimer,
    navigate,
    backTo,
    isFullscreen,
    showSpeedMenu,
    setShowSpeedMenu,
    videoRef,
    cycleSubtitleTrack,
    locked
  ])
}
