import { useState, useRef, useCallback, type RefObject } from 'react'
import { useDraggable } from './use-draggable'

export function useVolume(videoRef: RefObject<HTMLVideoElement | null>) {
  const volumeBarRef = useRef<HTMLDivElement>(null)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)

  const setVolumeFromX = useCallback(
    (clientX: number) => {
      const video = videoRef.current
      const bar = volumeBarRef.current
      if (!video || !bar) return
      const rect = bar.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      video.volume = pct
      setVolume(pct)
      if (pct > 0 && video.muted) {
        video.muted = false
        setMuted(false)
      }
    },
    [videoRef]
  )

  const { isDragging: isDraggingVolume, onMouseDown: onVolumeMouseDown } =
    useDraggable(setVolumeFromX)

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }, [videoRef])

  const adjustVolume = useCallback(
    (delta: number) => {
      const video = videoRef.current
      if (!video) return
      video.volume = Math.max(0, Math.min(1, video.volume + delta))
      setVolume(video.volume)
    },
    [videoRef]
  )

  return {
    volumeBarRef,
    volume,
    muted,
    isDraggingVolume,
    setVolume,
    setMuted,
    onVolumeMouseDown,
    toggleMute,
    adjustVolume
  }
}
