import { useState, useEffect, useRef, useCallback } from 'react'

export function useVideoPlayback(filePath: string | null) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)

  // Resolve video file and build localhost URL
  useEffect(() => {
    if (!filePath) {
      setError('No file path provided')
      setLoading(false)
      return
    }
    Promise.all([
      window.api.library.resolveVideo(filePath),
      window.api.video.serverPort()
    ]).then(([resolved, port]) => {
      if (resolved && port) {
        setVideoSrc(`http://127.0.0.1:${port}/video?path=${encodeURIComponent(resolved)}`)
      } else {
        setError('No video file found in download folder')
      }
      setLoading(false)
    })
  }, [filePath])

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

  return {
    videoRef,
    videoSrc,
    loading,
    error,
    playing,
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
    handleEnded
  }
}
