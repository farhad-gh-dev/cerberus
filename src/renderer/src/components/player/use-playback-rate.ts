import { useState, useEffect, useCallback, type RefObject } from 'react'

export function usePlaybackRate(videoRef: RefObject<HTMLVideoElement | null>) {
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  const changePlaybackRate = useCallback(
    (rate: number) => {
      const video = videoRef.current
      if (!video) return
      video.playbackRate = rate
      setPlaybackRate(rate)
      setShowSpeedMenu(false)
    },
    [videoRef]
  )

  const toggleSpeedMenu = useCallback(() => setShowSpeedMenu((prev) => !prev), [])

  // Close speed menu on outside click
  useEffect(() => {
    if (!showSpeedMenu) return
    const handler = (): void => setShowSpeedMenu(false)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [showSpeedMenu])

  return {
    playbackRate,
    showSpeedMenu,
    setShowSpeedMenu,
    changePlaybackRate,
    toggleSpeedMenu
  }
}
