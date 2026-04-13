import { useState, useCallback, useRef, type RefObject } from 'react'
import { useDraggable } from './use-draggable'

export function useSeekBar(
  videoRef: RefObject<HTMLVideoElement | null>,
  seekBarRef: RefObject<HTMLDivElement | null>,
  duration: number,
  setCurrentTime: (time: number) => void,
  streamId?: string
) {
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverX, setHoverX] = useState(0)

  // Store the file length from the most recent stats fetch so we can
  // compute byte offsets for smart seek re-prioritization.
  const fileLengthRef = useRef(0)

  // Keep fileLength up to date (called lazily from seekTo)
  const fetchFileLength = useCallback(async () => {
    if (!streamId) return
    try {
      const stats = await window.api.stream.stats(streamId)
      if (stats) fileLengthRef.current = stats.fileLength
    } catch {
      // ignore
    }
  }, [streamId])

  const seekTo = useCallback(
    (clientX: number) => {
      const video = videoRef.current
      const bar = seekBarRef.current
      if (!video || !bar || !duration) return
      const rect = bar.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      video.currentTime = pct * duration
      setCurrentTime(pct * duration)

      // Smart seek: re-prioritize torrent pieces around the new position
      if (streamId) {
        const fileLength = fileLengthRef.current
        if (fileLength > 0) {
          const byteOffset = Math.floor(pct * fileLength)
          window.api.stream.seek(streamId, byteOffset).catch(() => {})
        } else {
          // First seek — fetch file length then re-prioritize
          fetchFileLength().then(() => {
            if (fileLengthRef.current > 0) {
              const byteOffset = Math.floor(pct * fileLengthRef.current)
              window.api.stream.seek(streamId, byteOffset).catch(() => {})
            }
          })
        }
      }
    },
    [videoRef, seekBarRef, duration, setCurrentTime, streamId, fetchFileLength]
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
