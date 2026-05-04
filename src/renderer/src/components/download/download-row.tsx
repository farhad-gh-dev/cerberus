import { memo } from 'react'
import { GripVertical } from 'lucide-react'
import type { DownloadItem } from '@shared/types'
import { cn } from '../../utils/cn'
import { useDownloadActions } from '../../hooks/use-download-actions'
import ActionButtons from './download-action-buttons'
import ProgressBar from './download-progress-bar'
import StatsRow from './download-stats-row'
import Text from '../ui/text'

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

export interface DownloadRowProps extends DragProps {
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
        'rounded-xl border border-custom-300 dark:border-custom-700/70 bg-custom-50/60 dark:bg-custom-800/60 p-4 transition-all',
        isDragging && 'opacity-40 border-custom-300 dark:border-custom-700 scale-[0.98]',
        isDragOver && 'border-blue-500 bg-blue-500/5 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
    >
      {/* Header: name + actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {draggable && (
            <GripVertical
              size={16}
              className="text-custom-400 dark:text-custom-600 cursor-grab active:cursor-grabbing shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <Text size="lg" className="font-medium text-custom-800 dark:text-custom-50 truncate">
              {item.name}
            </Text>
          </div>
        </div>
        <ActionButtons item={item} showQueueButton={showQueueButton} actions={actions} />
      </div>

      {item.status !== 'completed' && item.status !== 'error' && <ProgressBar item={item} />}
      <StatsRow item={item} />
    </div>
  )
})
