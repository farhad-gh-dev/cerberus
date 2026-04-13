import { useState, useCallback } from 'react'
import type { SubtitleTrack, OnlineSubtitleResult } from '@shared/types'
import { stripIpcError } from './subtitle-utils'

export interface OnlineSubtitleActions {
  showOnlineSearch: boolean
  onlineResults: OnlineSubtitleResult[]
  searchingOnline: boolean
  onlineError: string | null
  downloadingId: string | null
  downloadedIds: Set<string>
  onlineLanguage: string
  searchOnline: (language?: string) => Promise<void>
  openOnlineSearch: () => void
  closeOnlineSearch: () => void
  changeOnlineLanguage: (lang: string) => void
  downloadAndActivate: (resultId: string) => Promise<void>
}

interface UseOnlineSubtitlesOptions {
  imdbId?: string
  videoFilePath: string | null
  serverPort: number | null
  onTrackAdded: (track: SubtitleTrack, url: string) => void
}

export function useOnlineSubtitles({
  imdbId,
  videoFilePath,
  serverPort,
  onTrackAdded
}: UseOnlineSubtitlesOptions): OnlineSubtitleActions {
  const [showOnlineSearch, setShowOnlineSearch] = useState(false)
  const [onlineResults, setOnlineResults] = useState<OnlineSubtitleResult[]>([])
  const [searchingOnline, setSearchingOnline] = useState(false)
  const [onlineError, setOnlineError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set())
  const [onlineLanguage, setOnlineLanguage] = useState('en')

  const searchOnline = useCallback(
    async (language?: string) => {
      if (!imdbId) return
      const lang = language || onlineLanguage
      setSearchingOnline(true)
      setOnlineResults([])
      setOnlineError(null)
      try {
        const results = await window.api.subtitles.searchOnline(imdbId, lang)
        setOnlineResults(results)
      } catch (err) {
        setOnlineError(stripIpcError(err))
        setOnlineResults([])
      } finally {
        setSearchingOnline(false)
      }
    },
    [imdbId, onlineLanguage]
  )

  const openOnlineSearch = useCallback(() => {
    setShowOnlineSearch(true)
  }, [])

  const closeOnlineSearch = useCallback(() => {
    setShowOnlineSearch(false)
    setOnlineResults([])
  }, [])

  const changeOnlineLanguage = useCallback(
    (lang: string) => {
      setOnlineLanguage(lang)
      if (imdbId) {
        searchOnline(lang)
      }
    },
    [imdbId, searchOnline]
  )

  const downloadAndActivate = useCallback(
    async (resultId: string) => {
      if (!videoFilePath || !serverPort) return
      setDownloadingId(resultId)
      setOnlineError(null)
      try {
        const track = await window.api.subtitles.download(resultId, videoFilePath)
        if (track) {
          const newUrl = `http://127.0.0.1:${serverPort}/subtitle?path=${encodeURIComponent(track.filePath)}`
          onTrackAdded(track, newUrl)
          setDownloadedIds((prev) => new Set(prev).add(resultId))
        }
      } catch (err) {
        setOnlineError(stripIpcError(err))
      } finally {
        setDownloadingId(null)
      }
    },
    [videoFilePath, serverPort, onTrackAdded]
  )

  return {
    showOnlineSearch,
    onlineResults,
    searchingOnline,
    onlineError,
    downloadingId,
    downloadedIds,
    onlineLanguage,
    searchOnline,
    openOnlineSearch,
    closeOnlineSearch,
    changeOnlineLanguage,
    downloadAndActivate
  }
}
