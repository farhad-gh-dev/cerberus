import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { DownloadItem } from '@shared/types'
import { formatBytes, formatSpeed, formatEta } from '../../utils/formatters'

export default function StatsRow({ item }: { item: DownloadItem }) {
  const navigate = useNavigate()
  const pct = Math.round(item.progress * 100)

  const isDownloading = item.status === 'downloading'
  const isQueued = item.status === 'queued'
  const isOnHold = item.status === 'on-hold'
  const isWaiting = isQueued || isOnHold

  return (
    <div className="flex items-center gap-4 mt-2 text-xs text-custom-600 dark:text-custom-400">
      {/* Progress % — always for active states, only when partial for waiting */}
      {(!isWaiting || pct > 0) && <span>{pct}%</span>}

      {/* Downloaded / total — whenever size is known (waiting only when partial) */}
      {item.totalSize > 0 && (!isWaiting || pct > 0) && (
        <span>
          {formatBytes(item.downloaded)} / {formatBytes(item.totalSize)}
        </span>
      )}

      {/* Waiting-state messages */}
      {isQueued && (
        <span className={pct > 0 ? 'text-custom-700 dark:text-custom-200' : ''}>
          Waiting for a download slot…
        </span>
      )}
      {isOnHold && (
        <span
          className={
            pct > 0
              ? 'text-custom-700 dark:text-custom-200'
              : 'text-orange-500/80 dark:text-orange-400/80'
          }
        >
          On hold — won't auto-start
        </span>
      )}

      {/* Live download stats */}
      {isDownloading && (
        <>
          <span>{formatSpeed(item.downloadSpeed)}</span>
          <span>ETA: {formatEta(item.timeRemaining)}</span>
          <span>{item.peers} peers</span>
          <button
            onClick={() => navigate(`/downloads/${item.id}`)}
            className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <MapPin size={12} />
            View Peers
          </button>
        </>
      )}
    </div>
  )
}
