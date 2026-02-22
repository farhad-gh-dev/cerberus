import { useEffect, useRef, useCallback } from 'react'
import type { DataPoint } from './types'
import { CHART_PADDING } from './stream-configs'
import { renderChart } from './speed-chart-renderer'

interface UseSpeedChartOptions {
  /** Current download speed (bytes/s) */
  downloadSpeed: number
  /** Current upload speed (bytes/s) */
  uploadSpeed: number
  /** How many seconds of history to keep */
  maxPoints: number
}

/**
 * Manages speed-history sampling and canvas rendering for SpeedChart.
 *
 * Responsibilities:
 *  1. Sample `downloadSpeed` / `uploadSpeed` once per second into a ring buffer.
 *  2. Set up a ResizeObserver so the canvas stays pixel-perfect.
 *  3. Re-draw the chart **only** when a new sample is pushed (1 fps),
 *     NOT on every animation frame — saving ~59/60 frames of GPU work.
 *
 * Returns refs the component should attach to its container `<div>` and `<canvas>`.
 */
export function useSpeedChart({ downloadSpeed, uploadSpeed, maxPoints }: UseSpeedChartOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // History is pre-filled so the chart always spans the full time window
  const historyRef = useRef<DataPoint[]>(
    Array.from({ length: maxPoints }, () => ({ down: 0, up: 0 }))
  )

  // Keep latest speed in a ref so the sampling interval always reads current values
  // without re-subscribing on every prop change.
  const latestSpeedRef = useRef<DataPoint>({ down: 0, up: 0 })
  useEffect(() => {
    latestSpeedRef.current = { down: downloadSpeed, up: uploadSpeed }
  }, [downloadSpeed, uploadSpeed])

  // Cached logical dimensions so we don't query the DOM on every draw
  const sizeRef = useRef({ w: 0, h: 0 })

  /** Render one frame using the current history + size. */
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { w, h } = sizeRef.current
    if (w === 0 || h === 0) return

    renderChart(ctx, w, h, historyRef.current, CHART_PADDING)
  }, [])

  // ── Canvas sizing (responds to container resizes) ──────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1

    function resize(): void {
      const w = container!.clientWidth
      const h = container!.clientHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w, h }

      // Re-draw immediately so there's no blank flash after resize
      drawFrame()
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)

    return () => observer.disconnect()
  }, [drawFrame])

  // ── 1 Hz sampling + rendering ──────────────────────────────────────
  useEffect(() => {
    const history = historyRef.current

    const interval = setInterval(() => {
      const { down, up } = latestSpeedRef.current
      history.push({ down, up })
      if (history.length > maxPoints) history.shift()

      // Draw exactly once per sample — no rAF loop needed
      drawFrame()
    }, 1000)

    return () => clearInterval(interval)
  }, [maxPoints, drawFrame])

  return { canvasRef, containerRef } as const
}
