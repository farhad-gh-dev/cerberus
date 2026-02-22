import { useState, useCallback, type RefObject } from 'react'
import { useDraggable } from './use-draggable'

export function useSeekBar(
  videoRef: RefObject<HTMLVideoElement | null>,
  seekBarRef: RefObject<HTMLDivElement | null>,
  duration: number,
  setCurrentTime: (time: number) => void
) {
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverX, setHoverX] = useState(0)

  const seekTo = useCallback(
    (clientX: number) => {
      const video = videoRef.current
      const bar = seekBarRef.current
      if (!video || !bar || !duration) return
      const rect = bar.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      video.currentTime = pct * duration
      setCurrentTime(pct * duration)
    },
    [videoRef, seekBarRef, duration, setCurrentTime]
  )

  const { isDragging: isSeeking, onMouseDown: onSeekMouseDown } = useDraggable(seekTo)

  const onSeekHover = useCallback(
    (e: React.MouseEvent) => {
      const bar = seekBarRef.current
      if (!bar || !duration) return
      const rect = bar.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      setHoverTime(pct * duration)
      setHoverX(e.clientX - rect.left)
    },
    [seekBarRef, duration]
  )

  const clearHoverTime = useCallback(() => setHoverTime(null), [])

  return {
    isSeeking,
    hoverTime,
    hoverX,
    onSeekMouseDown,
    onSeekHover,
    clearHoverTime
  }
}
