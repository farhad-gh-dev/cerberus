/**
 * Visual configuration for the upload and download stream layers.
 *
 * Each StreamConfig defines the colour palette and layering parameters
 * that produce the streamgraph's depth effect.
 */

import type { Padding, StreamConfig } from './types'

export const CHART_PADDING: Padding = { top: 8, right: 8, bottom: 8, left: 8 }

/** Upload stream — blue palette, drawn behind the download stream. */
export const UPLOAD_STREAM: StreamConfig = {
  layers: [
    {
      colorStops: ['rgba(15,23,80,0.25)', 'rgba(10,15,50,0.12)', 'rgba(5,8,30,0.02)'],
      opacity: 0.55,
      verticalShift: 20,
      scaleY: 0.6
    },
    {
      colorStops: ['rgba(29,78,216,0.35)', 'rgba(30,64,175,0.2)', 'rgba(29,48,120,0.04)'],
      opacity: 0.65,
      verticalShift: 13,
      scaleY: 0.75
    },
    {
      colorStops: ['rgba(59,130,246,0.45)', 'rgba(37,99,235,0.28)', 'rgba(29,78,216,0.06)'],
      opacity: 0.72,
      verticalShift: 7,
      scaleY: 0.88
    },
    {
      colorStops: [
        'rgba(96,165,250,0.65)',
        'rgba(59,130,246,0.4)',
        'rgba(37,99,235,0.12)',
        'rgba(29,78,216,0.02)'
      ],
      opacity: 0.82,
      verticalShift: 2,
      scaleY: 0.96
    },
    {
      colorStops: ['rgba(147,197,253,0.45)', 'rgba(96,165,250,0.12)', 'rgba(59,130,246,0.0)'],
      opacity: 0.4,
      verticalShift: -1,
      scaleY: 0.45
    }
  ],
  strokeColor: '#60a5fa',
  glowColor: 'rgba(96,165,250,0.12)',
  strokeWidth: 2
}

/** Download stream — green palette, drawn in front. */
export const DOWNLOAD_STREAM: StreamConfig = {
  layers: [
    {
      colorStops: ['rgba(5,46,22,0.2)', 'rgba(3,30,14,0.1)', 'rgba(2,15,8,0.01)'],
      opacity: 0.45,
      verticalShift: 24,
      scaleY: 0.55
    },
    {
      colorStops: ['rgba(21,128,61,0.3)', 'rgba(22,101,52,0.18)', 'rgba(5,46,22,0.03)'],
      opacity: 0.55,
      verticalShift: 16,
      scaleY: 0.7
    },
    {
      colorStops: ['rgba(34,197,94,0.4)', 'rgba(22,163,74,0.25)', 'rgba(21,128,61,0.06)'],
      opacity: 0.65,
      verticalShift: 9,
      scaleY: 0.82
    },
    {
      colorStops: [
        'rgba(74,222,128,0.6)',
        'rgba(34,197,94,0.4)',
        'rgba(22,163,74,0.12)',
        'rgba(21,128,61,0.02)'
      ],
      opacity: 0.78,
      verticalShift: 3,
      scaleY: 0.94
    },
    {
      colorStops: [
        'rgba(134,239,172,0.7)',
        'rgba(74,222,128,0.45)',
        'rgba(34,197,94,0.15)',
        'rgba(22,163,74,0.03)'
      ],
      opacity: 0.85,
      verticalShift: 0,
      scaleY: 1.0
    },
    {
      colorStops: ['rgba(187,247,208,0.5)', 'rgba(134,239,172,0.1)', 'rgba(74,222,128,0.0)'],
      opacity: 0.45,
      verticalShift: -2,
      scaleY: 0.42
    }
  ],
  strokeColor: '#4ade80',
  glowColor: 'rgba(74,222,128,0.15)',
  strokeWidth: 2.5
}
