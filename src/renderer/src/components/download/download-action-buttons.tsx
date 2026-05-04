import type { ReactNode } from 'react'
import { Play, Trash2, Clock, CircleOff, Library } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { DownloadItem } from '@shared/types'
import { cn } from '../../utils/cn'
import type { useDownloadActions } from '../../hooks/use-download-actions'

function ActionButton({
  onClick,
  title,
  className,
  hoverBg = 'hover:bg-custom-300 dark:hover:bg-custom-600',
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
        'w-8 h-8 rounded-lg bg-custom-200 dark:bg-custom-700 flex items-center justify-center transition-colors',
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
  const navigate = useNavigate()
  const isDownloading = item.status === 'downloading'
  const isQueued = item.status === 'queued'
  const isOnHold = item.status === 'on-hold'
  const isCompleted = item.status === 'completed'
  const isError = item.status === 'error'

  const handleViewInLibrary = (): void => {
    if (!item.imdbId) return
    navigate(`/library/${item.imdbId}`)
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      {isDownloading && showQueueButton && (
        <ActionButton
          onClick={actions.pause}
          title="Put in queue"
          className="text-custom-500 dark:text-custom-400"
        >
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
          className="text-custom-500 dark:text-custom-400 hover:text-red-400"
          hoverBg="hover:bg-red-100 dark:hover:bg-red-500/20"
        >
          <Trash2 size={14} />
        </ActionButton>
      )}
      {isCompleted && item.imdbId && (
        <ActionButton
          onClick={handleViewInLibrary}
          title="View in library"
          className="text-blue-400"
        >
          <Library size={14} />
        </ActionButton>
      )}
      {(isCompleted || isError) && (
        <ActionButton
          onClick={actions.delete}
          title="Delete"
          className="text-custom-500 dark:text-custom-400 hover:text-red-400"
          hoverBg="hover:bg-red-100 dark:hover:bg-red-500/20"
        >
          <Trash2 size={14} />
        </ActionButton>
      )}
    </div>
  )
}
