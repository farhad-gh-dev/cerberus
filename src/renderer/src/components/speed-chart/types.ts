export interface DataPoint {
  down: number
  up: number
}

export interface Point {
  x: number
  y: number
}

export interface Padding {
  top: number
  right: number
  bottom: number
  left: number
}

/** A single "depth layer" in the streamgraph */
export interface StreamLayer {
  colorStops: string[]
  opacity: number
  verticalShift: number
  scaleY: number
}

/** Full config for one data series (upload or download) */
export interface StreamConfig {
  layers: StreamLayer[]
  strokeColor: string
  glowColor: string
  strokeWidth: number
}
