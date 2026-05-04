import { useRef, useState, useEffect } from 'react'
import type { DownloadItem } from '@shared/types'
import { cn } from '../../utils/cn'
import { barColor } from './download-status'

const SEGMENT_WIDTH = 5
const SEGMENT_HEIGHT = 45
const GAP = 5
const SEGMENT_STYLE = { width: SEGMENT_WIDTH, height: SEGMENT_HEIGHT }

function computeSegmentCount(containerWidth: number): number {
  return Math.max(1, Math.floor((containerWidth + GAP) / (SEGMENT_WIDTH + GAP)))
}

export default function ProgressBar({ item }: { item: DownloadItem }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [segmentCount, setSegmentCount] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // sync measure on mount to skip the 0-segment frame
    setSegmentCount(computeSegmentCount(el.clientWidth))

    const observer = new ResizeObserver(([entry]) => {
      setSegmentCount(computeSegmentCount(entry.contentRect.width))
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const filledCount = Math.round(item.progress * segmentCount)
  const isWaiting = item.status === 'queued' || item.status === 'on-hold'
  const showEmpty = isWaiting && filledCount === 0

  const filledClass = cn('shrink-0 rounded-xs', barColor[item.status])
  const emptyClass = 'shrink-0 rounded-xs bg-custom-200 dark:bg-custom-700/40'

  return (
    <div ref={containerRef} style={{ gap: GAP }} className="mt-3 flex">
      {Array.from({ length: segmentCount }, (_, i) => (
        <div
          key={i}
          style={SEGMENT_STYLE}
          className={showEmpty || i >= filledCount ? emptyClass : filledClass}
        />
      ))}
    </div>
  )
}
