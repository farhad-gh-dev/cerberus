import { useState, useEffect, useRef } from 'react'

export interface StreamingStats {
  downloadSpeed: number
  uploadSpeed: number
  numPeers: number
  /** 0–1 overall torrent progress */
  progress: number
  downloaded: number
  fileLength: number
  numPieces: number
  /** Downloaded byte ranges as [startPct, endPct] (0–100) */
  downloadedRanges: [number, number][]
}

/**
 * Polls the main process for live streaming stats while a streaming session
 * is active. Returns `null` when not streaming.
 */
export function useStreamingStats(streamId: string | undefined): StreamingStats | null {
  const [stats, setStats] = useState<StreamingStats | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!streamId) {
      setStats(null)
      return
    }

    const poll = async () => {
      try {
        const result = await window.api.stream.stats(streamId)
        if (result) setStats(result)
      } catch {
        // session may have ended
      }
    }

    poll()
    timerRef.current = setInterval(poll, 2000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [streamId])

  return stats
}
