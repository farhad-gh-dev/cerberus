import { useState, useEffect } from 'react'
import { ArrowDown, Users, HardDrive, X, Download, Radio } from 'lucide-react'
import PageLoader from '../ui/loading-spinner'
import type { TorrentResult } from '@shared/types'

interface TorrentResultsProps {
  movieTitle: string
  movieYear: string
  imdbId: string
  onClose: () => void
  onDownload: (torrent: TorrentResult) => Promise<void>
  streamMode?: boolean
}

const qualityColor: Record<string, string> = {
  '2160p': 'bg-purple-500/20 text-purple-400',
  '1080p': 'bg-blue-500/20 text-blue-400',
  '720p': 'bg-green-500/20 text-green-400',
  '480p': 'bg-yellow-500/20 text-yellow-400'
}

export default function TorrentResults({
  movieTitle,
  movieYear,
  imdbId,
  onClose,
  onDownload,
  streamMode
}: TorrentResultsProps) {
  const [results, setResults] = useState<TorrentResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    window.api.torrent
      .search(`${movieTitle} ${movieYear}`, imdbId)
      .then((data) => {
        setResults(data)
        if (data.length === 0) setError('No torrents found for this movie')
      })
      .catch(() => setError('Failed to search for torrents'))
      .finally(() => setLoading(false))
  }, [movieTitle, movieYear, imdbId])

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-custom-100 dark:bg-custom-900 dark:ring-2 dark:ring-white/8 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-custom-200 dark:border-custom-700/70">
          <div>
            <h2 className="text-lg font-bold text-custom-800 dark:text-custom-50">
              {streamMode ? 'Select Torrent to Stream' : 'Available Torrents'}
            </h2>
            <p className="text-sm text-custom-500 dark:text-custom-400 mt-0.5">
              {movieTitle} ({movieYear})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-custom-200 hover:bg-custom-300 text-custom-600 dark:bg-custom-800 dark:hover:bg-custom-700 dark:text-custom-400 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading && <PageLoader size={28} className="py-16" />}

          {!loading && error && (
            <p className="text-custom-500 dark:text-custom-400 text-center py-16 text-sm">
              {error}
            </p>
          )}

          {!loading &&
            results.map((torrent, i) => (
              <div
                key={`${torrent.magnetLink}-${i}`}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-custom-200/60 dark:hover:bg-custom-800/50 transition-colors group"
              >
                {/* Quality badge */}
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${qualityColor[torrent.quality] || 'bg-custom-200 text-custom-700 dark:bg-custom-700 dark:text-custom-300'}`}
                >
                  {torrent.quality}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-custom-800 dark:text-custom-50 truncate">
                    {torrent.name}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-custom-500 dark:text-custom-400">
                    <span className="flex items-center gap-1">
                      <HardDrive size={12} /> {torrent.size}
                    </span>
                    {torrent.seeds > 0 && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <ArrowDown size={12} /> {torrent.seeds} seeds
                      </span>
                    )}
                    {torrent.peers > 0 && (
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {torrent.peers} peers
                      </span>
                    )}
                    <span className="text-custom-400 dark:text-custom-500">{torrent.source}</span>
                  </div>
                </div>

                {/* Download button */}
                <button
                  disabled={downloadingIndex !== null}
                  onClick={async () => {
                    setDownloadingIndex(i)
                    try {
                      await onDownload(torrent)
                    } finally {
                      setDownloadingIndex(null)
                    }
                  }}
                  className={`shrink-0 flex items-center gap-1.5 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors ${
                    downloadingIndex === i
                      ? `${streamMode ? 'bg-emerald-500/70' : 'bg-blue-500/70'} cursor-wait opacity-100`
                      : downloadingIndex !== null
                        ? 'opacity-0 pointer-events-none'
                        : `${streamMode ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} opacity-0 group-hover:opacity-100`
                  }`}
                >
                  {downloadingIndex === i ? (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />{' '}
                      {streamMode ? 'Loading…' : 'Starting…'}
                    </>
                  ) : (
                    <>
                      {streamMode ? <Radio size={14} /> : <Download size={14} />}{' '}
                      {streamMode ? 'Stream' : 'Download'}
                    </>
                  )}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
