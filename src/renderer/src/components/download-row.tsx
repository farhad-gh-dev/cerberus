import { memo } from 'react'
import { GripVertical } from 'lucide-react'
import type { DownloadItem } from '@shared/types'
import { cn } from '../utils/cn'
import { useDownloadActions } from '../hooks/use-download-actions'
import { statusLabel, statusColor, statusIcon } from './download-status'
import ActionButtons from './download-action-buttons'
import ProgressBar from './download-progress-bar'
import StatsRow from './download-stats-row'

// ---------- Props ----------

interface DragProps {
  draggable?: boolean
  isDragging?: boolean
  isDragOver?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragEnter?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}

interface DownloadRowProps extends DragProps {
  item: DownloadItem
  showQueueButton?: boolean
}

// ---------- Main component ----------

export default memo(function DownloadRow({
  item,
  showQueueButton = true,
  draggable = false,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop
}: DownloadRowProps) {
  const actions = useDownloadActions(item.id)
  const StatusIcon = statusIcon[item.status]

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'bg-zinc-900 border rounded-xl p-4 transition-all',
        isDragging && 'opacity-40 border-zinc-700 scale-[0.98]',
        isDragOver && 'border-blue-500 bg-blue-500/5 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
        !isDragging && !isDragOver && 'border-zinc-800',
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
    >
      {/* Header: name + status + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {draggable && (
            <GripVertical
              size={16}
              className="text-zinc-600 cursor-grab active:cursor-grabbing shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{item.name}</p>
            <p className={cn('text-xs mt-0.5 flex items-center gap-1', statusColor[item.status])}>
              {StatusIcon && <StatusIcon size={11} />}
              {statusLabel[item.status]}
            </p>
          </div>
        </div>
        <ActionButtons item={item} showQueueButton={showQueueButton} actions={actions} />
      </div>

      <ProgressBar item={item} />
      <StatsRow item={item} />
    </div>
  )
})
