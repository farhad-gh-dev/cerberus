import { Pause, Play, Trash2, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { DownloadItem } from '@shared/types'
import { formatBytes, formatSpeed, formatEta } from '../utils/formatters'
import { useDownloadsStore } from '../stores/downloads'

const statusLabel: Record<string, string> = {
  downloading: 'Downloading',
  paused: 'Paused',
  completed: 'Completed',
  error: 'Error'
}

const statusColor: Record<string, string> = {
  downloading: 'text-blue-400',
  paused: 'text-yellow-400',
  completed: 'text-green-400',
  error: 'text-red-400'
}

export default function DownloadRow({ item }: { item: DownloadItem }) {
  const progressPct = Math.round(item.progress * 100)
  const { pause, resume, cancel, delete: del } = useDownloadsStore()
  const navigate = useNavigate()

  const handlePause = () => pause(item.id)
  const handleResume = () => resume(item.id)
  const handleCancel = () => cancel(item.id)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      {/* Top row: name + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{item.name}</p>
          <p className={`text-xs mt-0.5 ${statusColor[item.status]}`}>{statusLabel[item.status]}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {item.status === 'downloading' && (
            <button
              onClick={handlePause}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors"
              title="Pause"
            >
              <Pause size={14} />
            </button>
          )}
          {item.status === 'paused' && (
            <button
              onClick={handleResume}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-blue-400 transition-colors"
              title="Resume"
            >
              <Play size={14} />
            </button>
          )}
          {item.status !== 'completed' && (
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-red-500/20 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors"
              title="Cancel"
            >
              <Trash2 size={14} />
            </button>
          )}
          {(item.status === 'completed' || item.status === 'error') && (
            <button
              onClick={() => del(item.id)}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-red-500/20 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {item.status !== 'error' && (
        <div className="mt-3">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                item.status === 'completed'
                  ? 'bg-green-500'
                  : item.status === 'paused'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
        <span>{progressPct}%</span>
        {item.totalSize > 0 && (
          <span>
            {formatBytes(item.downloaded)} / {formatBytes(item.totalSize)}
          </span>
        )}
        {item.status === 'downloading' && (
          <>
            <span>{formatSpeed(item.downloadSpeed)}</span>
            <span>ETA: {formatEta(item.timeRemaining)}</span>
            <span>{item.peers} peers</span>
          </>
        )}
        {(item.status === 'downloading' || item.status === 'paused') && (
          <button
            onClick={() => navigate(`/downloads/${item.id}`)}
            className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <MapPin size={12} />
            View Peers
          </button>
        )}
        {item.status === 'completed' && (
          <button
            onClick={() => navigate(`/downloads/${item.id}`)}
            className="ml-auto flex items-center gap-1 text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <MapPin size={12} />
            View Peers
          </button>
        )}
      </div>
    </div>
  )
}
