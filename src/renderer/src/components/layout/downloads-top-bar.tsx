import { Link, Radio } from 'lucide-react'
import Heading from '../ui/heading'

interface DownloadsTopBarProps {
  activeCount: number
  queuedCount: number
  onHoldCount: number
  completedCount: number
  onAddMagnet: () => void
  onStreamMagnet: () => void
}

export default function DownloadsTopBar({
  activeCount,
  queuedCount,
  onHoldCount,
  completedCount,
  onAddMagnet,
  onStreamMagnet
}: DownloadsTopBarProps) {
  const parts: string[] = []
  if (completedCount > 0) parts.push(`${completedCount} completed`)
  if (activeCount > 0) parts.push(`${activeCount} active`)
  if (queuedCount > 0) parts.push(`${queuedCount} queued`)
  if (onHoldCount > 0) parts.push(`${onHoldCount} on hold`)

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left — Page title + stats */}
      <div className="flex items-baseline gap-3 shrink-0">
        <Heading level={1} className="!font-semibold">
          Downloads
        </Heading>
        <span className="text-custom-500 dark:text-custom-400 text-sm">{parts.join(', ')}</span>
      </div>

      {/* Right — Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onStreamMagnet}
          className="flex items-center gap-2 bg-custom-800 hover:bg-custom-700 text-custom-50 dark:bg-custom-50 dark:hover:bg-custom-200 dark:text-custom-800 text-sm xl:text-base font-medium px-4 py-2.5 xl:py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Radio size={16} />
          Stream Magnet
        </button>
        <button
          onClick={onAddMagnet}
          className="flex items-center gap-2 bg-custom-800 hover:bg-custom-700 text-custom-50 dark:bg-custom-50 dark:hover:bg-custom-200 dark:text-custom-800 text-sm xl:text-base font-medium px-4 py-2.5 xl:py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Link size={16} />
          Add Magnet Link
        </button>
      </div>
    </div>
  )
}
