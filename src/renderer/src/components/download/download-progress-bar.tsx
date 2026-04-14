import type { DownloadItem } from '@shared/types'
import { cn } from '../../utils/cn'
import { barColor } from './download-status'

export default function ProgressBar({ item }: { item: DownloadItem }) {
  if (item.status === 'error') return null

  const pct = Math.round(item.progress * 100)
  const isWaiting = item.status === 'queued' || item.status === 'on-hold'
  const showEmpty = isWaiting && pct === 0

  return (
    <div className="mt-3">
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        {showEmpty ? (
          <div className="h-full rounded-full bg-zinc-600 w-full opacity-30" />
        ) : (
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor[item.status])}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  )
}
