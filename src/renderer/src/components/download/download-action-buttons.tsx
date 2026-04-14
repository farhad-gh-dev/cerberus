import type { ReactNode } from 'react'
import { Play, Trash2, Clock, CircleOff } from 'lucide-react'
import type { DownloadItem } from '@shared/types'
import { cn } from '../../utils/cn'
import type { useDownloadActions } from '../../hooks/use-download-actions'

function ActionButton({
  onClick,
  title,
  className,
  hoverBg = 'hover:bg-zinc-700',
  children
}: {
  onClick: () => void
  title: string
  className?: string
  hoverBg?: string
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center transition-colors',
        hoverBg,
        className
      )}
      title={title}
    >
      {children}
    </button>
  )
}

export default function ActionButtons({
  item,
  showQueueButton,
  actions
}: {
  item: DownloadItem
  showQueueButton: boolean
  actions: ReturnType<typeof useDownloadActions>
}) {
  const isDownloading = item.status === 'downloading'
  const isQueued = item.status === 'queued'
  const isOnHold = item.status === 'on-hold'
  const isCompleted = item.status === 'completed'
  const isError = item.status === 'error'

  return (
    <div className="flex items-center gap-1 shrink-0">
      {isDownloading && showQueueButton && (
        <ActionButton onClick={actions.pause} title="Put in queue" className="text-zinc-400">
          <Clock size={14} />
        </ActionButton>
      )}
      {isQueued && (
        <ActionButton onClick={actions.resume} title="Start now" className="text-blue-400">
          <Play size={14} />
        </ActionButton>
      )}
      {isOnHold && (
        <ActionButton onClick={actions.unhold} title="Move to queue" className="text-blue-400">
          <Play size={14} />
        </ActionButton>
      )}
      {(isDownloading || isQueued) && (
        <ActionButton onClick={actions.hold} title="Put on hold" className="text-orange-400">
          <CircleOff size={14} />
        </ActionButton>
      )}
      {!isCompleted && (
        <ActionButton
          onClick={actions.cancel}
          title="Cancel"
          className="text-zinc-400 hover:text-red-400"
          hoverBg="hover:bg-red-500/20"
        >
          <Trash2 size={14} />
        </ActionButton>
      )}
      {(isCompleted || isError) && (
        <ActionButton
          onClick={actions.delete}
          title="Delete"
          className="text-zinc-400 hover:text-red-400"
          hoverBg="hover:bg-red-500/20"
        >
          <Trash2 size={14} />
        </ActionButton>
      )}
    </div>
  )
}
