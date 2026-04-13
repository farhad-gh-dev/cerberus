import { useState, useEffect, useRef, useCallback } from 'react'

export function useVideoPlayback(filePath: string | null, streamId?: string) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)

  // Resolve video source — either from a streaming session or a file on disk
  useEffect(() => {
    if (streamId) {
      // Streaming mode: build URL from session ID
      window.api.video.serverPort().then((port) => {
        if (port) {
          setVideoSrc(`http://127.0.0.1:${port}/stream?id=${encodeURIComponent(streamId)}`)
          // Show buffering spinner while torrent data loads (before canplay fires)
          setBuffering(true)
        } else {
          setError('Video server not available')
        }
        setLoading(false)
      })
      return
    }

    if (!filePath) {
      setError('No file path provided')
      setLoading(false)
      return
    }
    Promise.all([window.api.library.resolveVideo(filePath), window.api.video.serverPort()]).then(
      ([resolved, port]) => {
        if (resolved && port) {
          setVideoSrc(`http://127.0.0.1:${port}/video?path=${encodeURIComponent(resolved)}`)
        } else {
          setError('No video file found in download folder')
        }
        setLoading(false)
      }
    )
  }, [filePath, streamId])

  // Cleanup streaming session when player truly unmounts.
  // Use a ref + timeout to survive React StrictMode's double-mount cycle
  // (mount → cleanup → mount), which would otherwise kill the session immediately.
  const streamCleanupTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!streamId) return

    // If a pending cleanup was scheduled by StrictMode's first unmount, cancel it
    if (streamCleanupTimer.current) {
      clearTimeout(streamCleanupTimer.current)
      streamCleanupTimer.current = null
    }

    return () => {
      // Delay the stop call so StrictMode's immediate remount can cancel it
      const id = streamId
      streamCleanupTimer.current = setTimeout(() => {
        window.api.stream.stop(id).catch(() => {})
        streamCleanupTimer.current = null
      }, 200)
    }
  }, [streamId])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    playing ? video.pause() : video.play()
  }, [playing])

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
  }, [])

  const updateBuffered = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.buffered.length || !duration) return
    setBuffered(video.buffered.end(video.buffered.length - 1))
  }, [duration])

  // Video element event handlers
  const handlePlay = useCallback(() => setPlaying(true), [])
  const handlePause = useCallback(() => setPlaying(false), [])
  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(videoRef.current?.currentTime || 0)
    updateBuffered()
  }, [updateBuffered])
  const handleLoadedMetadata = useCallback(() => {
    setDuration(videoRef.current?.duration || 0)
    updateBuffered()
  }, [updateBuffered])
  const handleEnded = useCallback(() => setPlaying(false), [])
  const handleWaiting = useCallback(() => setBuffering(true), [])
  const handleCanPlay = useCallback(() => setBuffering(false), [])

  // Autoplay once the video source is ready
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return
    const tryAutoplay = (): void => {
      video.play().catch(() => {})
    }
    video.addEventListener('canplay', tryAutoplay, { once: true })
    return () => video.removeEventListener('canplay', tryAutoplay)
  }, [videoSrc])

  return {
    videoRef,
    videoSrc,
    loading,
    error,
    playing,
    buffering,
    currentTime,
    setCurrentTime,
    duration,
    buffered,
    togglePlay,
    skip,
    handlePlay,
    handlePause,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleProgress: updateBuffered,
    handleEnded,
    handleWaiting,
    handleCanPlay
  }
}
