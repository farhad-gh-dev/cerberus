import type { CSSProperties } from 'react'

interface PageLoaderProps {
  size?: number
  className?: string
}

const barLoaderKeyframes = `
  @keyframes loading-spinner-bar-pulse {
    0%,
    100% {
      opacity: 0.45;
      transform: scaleY(1);
    }
    20% {
      opacity: 1;
      transform: scaleY(1.5);
    }
    40% {
      opacity: 0.65;
      transform: scaleY(1);
    }
  }
`

export default function PageLoader({ size = 32, className = '' }: PageLoaderProps) {
  const loaderSize = Math.max(size, 14)
  const barWidth = Math.max(Math.round(loaderSize * 0.1), 3)
  const shortBarHeight = Math.max(Math.round(loaderSize * 0.62), 12)
  const tallBarHeight = Math.max(Math.round(loaderSize * 1.1), shortBarHeight + 6)
  const gap = Math.max(Math.round(loaderSize * 0.16), 4)

  const sharedBarStyle: CSSProperties = {
    width: `${barWidth}px`,
    height: `${shortBarHeight}px`,
    animation: 'loading-spinner-bar-pulse 1s linear infinite',
    transformOrigin: 'center center'
  }

  const middleBarStyle: CSSProperties = {
    ...sharedBarStyle,
    height: `${tallBarHeight}px`,
    animationDelay: '0.25s'
  }

  const trailingBarStyle: CSSProperties = {
    ...sharedBarStyle,
    animationDelay: '0.5s'
  }

  return (
    <div
      className={`flex min-h-[150px] items-center justify-center text-zinc-800 dark:text-zinc-200 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <style>{barLoaderKeyframes}</style>
      <div className="flex items-center" style={{ gap: `${gap}px` }}>
        <span className="block rounded-full bg-current" style={sharedBarStyle} />
        <span className="block rounded-full bg-current" style={middleBarStyle} />
        <span className="block rounded-full bg-current" style={trailingBarStyle} />
      </div>
    </div>
  )
}
