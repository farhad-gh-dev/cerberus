import { memo } from 'react'
import { formatBytes } from '../../utils/formatters'

const RING_MIN = 150
const RING_MAX = 220
const RING_RADIUS = 32
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

interface DownloadProgressRingProps {
  downloaded: number
  totalSize: number
  progress: number
}

export const DownloadProgressRing = memo(function DownloadProgressRing({
  downloaded,
  totalSize,
  progress
}: DownloadProgressRingProps) {
  const offset = RING_CIRCUMFERENCE * (1 - progress)

  return (
    <div
      className="relative shrink-0"
      style={{
        width: `clamp(${RING_MIN}px, 12vw, ${RING_MAX}px)`,
        height: `clamp(${RING_MIN}px, 12vw, ${RING_MAX}px)`
      }}
    >
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        {/* Background track */}
        <circle
          cx="40"
          cy="40"
          r={RING_RADIUS}
          fill="none"
          className="stroke-custom-200 dark:stroke-white/10"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx="40"
          cy="40"
          r={RING_RADIUS}
          fill="none"
          className="stroke-custom-800 dark:stroke-white transition-all duration-500"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-custom-800 dark:text-custom-50">
          {formatBytes(downloaded)}
        </span>
        <span className="text-[10px] text-custom-500 dark:text-custom-400">
          / {formatBytes(totalSize)}
        </span>
      </div>
    </div>
  )
})
