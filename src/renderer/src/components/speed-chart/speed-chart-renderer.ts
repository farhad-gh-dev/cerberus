import type { DataPoint, Padding, Point, StreamConfig, StreamLayer } from './types'
import { CHART_PADDING, UPLOAD_STREAM, DOWNLOAD_STREAM } from './stream-configs'

const DEFAULT_TENSION = 0.35

/** Catmull-Rom → cubic Bezier control points for ultra-smooth curves. */
export function catmullRomToBezier(points: Point[], tension = DEFAULT_TENSION): Point[] {
  if (points.length < 2) return [...points]

  const path: Point[] = []
  for (let i = 0; i < points.length; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[Math.min(i + 1, points.length - 1)]
    const p3 = points[Math.min(i + 2, points.length - 1)]

    if (i === 0) path.push(p1)

    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 3
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 3
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 3
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 3

    path.push({ x: cp1x, y: cp1y }, { x: cp2x, y: cp2y }, p2)
  }
  return path
}

/** Trace a smooth Catmull-Rom path onto the current canvas sub-path. */
export function traceSmooth(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  tension = DEFAULT_TENSION
): void {
  if (points.length < 2) return
  const bez = catmullRomToBezier(points, tension)
  ctx.moveTo(bez[0].x, bez[0].y)
  for (let i = 1; i < bez.length - 2; i += 3) {
    ctx.bezierCurveTo(bez[i].x, bez[i].y, bez[i + 1].x, bez[i + 1].y, bez[i + 2].x, bez[i + 2].y)
  }
}

/** Map a data array into canvas-space {x,y} points. */
export function buildPoints(
  data: number[],
  maxVal: number,
  plotW: number,
  plotH: number,
  pad: Padding
): Point[] {
  const step = plotW / Math.max(data.length - 1, 1)
  return data.map((v, i) => ({
    x: pad.left + i * step,
    y: pad.top + plotH - (v / maxVal) * plotH
  }))
}

/** Draw one filled "wave" layer of a streamgraph. */
export function drawStreamLayer(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  bottomY: number,
  layer: StreamLayer
): void {
  if (points.length < 2) return

  const { colorStops, opacity, verticalShift, scaleY } = layer

  const layerPts = points.map((p) => ({
    x: p.x,
    y: Math.min(bottomY - (bottomY - p.y) * scaleY + verticalShift, bottomY)
  }))

  ctx.save()
  ctx.globalAlpha = opacity
  ctx.beginPath()
  traceSmooth(ctx, layerPts)
  ctx.lineTo(layerPts[layerPts.length - 1].x, bottomY)
  ctx.lineTo(layerPts[0].x, bottomY)
  ctx.closePath()

  const topY = Math.min(...layerPts.map((p) => p.y))
  const grad = ctx.createLinearGradient(0, topY, 0, bottomY)
  const stopStep = 1 / Math.max(colorStops.length - 1, 1)
  colorStops.forEach((c, i) => grad.addColorStop(Math.min(i * stopStep, 1), c))
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()
}

/** Stroke the top edge of a stream with a soft glow + core line. */
export function drawStreamStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  glowColor: string,
  lineWidth: number
): void {
  if (points.length < 2) return

  // Soft glow
  ctx.save()
  ctx.beginPath()
  traceSmooth(ctx, points)
  ctx.strokeStyle = glowColor
  ctx.lineWidth = lineWidth + 8
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.restore()

  // Core line
  ctx.beginPath()
  traceSmooth(ctx, points)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
}

/** Render an entire data series (all layers + stroke). */
export function drawStream(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  bottomY: number,
  config: StreamConfig
): void {
  for (const layer of config.layers) {
    drawStreamLayer(ctx, points, bottomY, layer)
  }
  drawStreamStroke(ctx, points, config.strokeColor, config.glowColor, config.strokeWidth)
}

/** Compute a safe Y-axis max from history, with 30 % headroom. */
function computeMaxValue(history: DataPoint[]): number {
  let max = 0
  for (const p of history) {
    if (p.down > max) max = p.down
    if (p.up > max) max = p.up
  }
  return max * 1.3 || 1024
}

/**
 * Render a complete speed chart frame.
 * Pure function — all state is passed in, nothing is mutated.
 */
export function renderChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  history: DataPoint[],
  pad: Padding = CHART_PADDING
): void {
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const bottomY = pad.top + plotH

  ctx.clearRect(0, 0, width, height)

  const maxVal = computeMaxValue(history)

  // Upload (behind)
  const upPoints = buildPoints(
    history.map((p) => p.up),
    maxVal,
    plotW,
    plotH,
    pad
  )
  drawStream(ctx, upPoints, bottomY, UPLOAD_STREAM)

  // Download (front)
  const downPoints = buildPoints(
    history.map((p) => p.down),
    maxVal,
    plotW,
    plotH,
    pad
  )
  drawStream(ctx, downPoints, bottomY, DOWNLOAD_STREAM)
}
