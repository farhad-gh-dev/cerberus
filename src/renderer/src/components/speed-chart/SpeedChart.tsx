import { useSpeedChart } from './use-speed-chart'

interface SpeedChartProps {
  downloadSpeed: number
  uploadSpeed: number
  /** Maximum number of data points to keep (seconds of history) */
  maxPoints?: number
}

export default function SpeedChart({
  downloadSpeed,
  uploadSpeed,
  maxPoints = 60
}: SpeedChartProps) {
  const { canvasRef, containerRef } = useSpeedChart({
    downloadSpeed,
    uploadSpeed,
    maxPoints
  })

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
