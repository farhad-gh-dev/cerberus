// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GlobeMarker {
  lat: number
  lon: number
  size: number // 0-1 normalized
}

export interface GlobeOptions {
  focusLat?: number
  focusLon?: number
}

export interface ContinentColors {
  main: number
  bright: number
  glow: number
  glowRgba: (a: number) => string
}

// ---------------------------------------------------------------------------
// Configuration — edit these values to tweak the globe and markers
// ---------------------------------------------------------------------------

export const GLOBE_CONFIG = {
  // Camera
  camera: {
    fov: 40,
    position: { x: 0, y: -0.2, z: 2.2 },
    lookAt: { x: 0, y: 0.4, z: 0 }
  },

  // Globe rotation & tilt
  globe: {
    tiltX: 0.15, // axial tilt in radians (~20°)
    idleSpeed: 0.002, // rotation speed when no peer focused
    lerpSpeed: 0.04, // how fast globe rotates to target
    latTiltFactor: 0.5 // how much latitude affects X tilt when focusing
  },

  // Dotted land surface
  land: {
    color: 0x3388ff,
    oceanColor: 0x0a1428,
    dotDensity: 220.0,
    dotRadius: 0.32
  },

  // Atmosphere glow
  atmosphere: {
    color: 0x1a3a8a,
    intensity: 0.7,
    radius: 1.18
  },

  // Grid lines (lat/lon)
  grid: {
    color: 0x1a2a5a,
    opacity: 0.2,
    spacing: 30 // degrees between lines
  },

  // Bottom glow plane
  bottomGlow: {
    color: 0x3355cc,
    size: 2.5,
    positionY: -1.3
  },

  // Lights
  lights: {
    ambient: { color: 0x111133, intensity: 0.5 },
    directional: { color: 0x4466ff, intensity: 0.6, position: { x: 5, y: 3, z: 5 } },
    point: { color: 0x6644ff, intensity: 0.4, distance: 10, position: { x: -3, y: 2, z: -3 } }
  },

  // Peer markers (nodes)
  markers: {
    surfaceRadius: 1.015, // how far above globe surface
    baseScaleMin: 0.02, // minimum marker scale
    baseScaleMax: 0.055, // scale multiplied by size (0-1)
    ringCount: 2, // number of stacked ring levels
    ringRadius: 0.5, // ring radius relative to baseScale
    ringThickness: 0.9, // inner radius = radius * this (closer to 1 = thinner)
    ringLevelSpacing: 0.45, // vertical gap between ring levels (× baseScale)
    innerGlowRadius: 0.85, // inner glow circle (× ring radius)
    innerGlowOpacity: 0.12,
    baseRing: { innerRadius: 0.14, outerRadius: 0.18 }, // small ring at spike base
    spikeStartFactor: 0.65, // where spike begins (× baseScale)
    spikeHeightFactor: 2.3, // spike total height (× baseScale)
    spikeHeightSizeBoost: 0.05, // extra height per size unit
    spikeRadius: 0.02, // cylinder radius (× baseScale)
    spikeOpacity: 1,
    tipCoreRadius: 0.04, // bright dot at tip (× baseScale)
    glowSpriteSize: 1.2, // glow sprite scale (× baseScale)
    glowGradientStops: [0, 0.15, 0.4, 0.7, 1] as readonly number[],
    glowGradientAlphas: [1, 0.8, 0.3, 0.08, 0] as readonly number[],
    scaleInSpeed: 0.035 // animation lerp factor for new markers
  },

  // Flame effect on markers
  flame: {
    enabled: true, // set to false to disable flame effects entirely
    widthFactor: 2, // flame plane width relative to baseScale
    heightFactor: 5.0, // flame plane height relative to baseScale
    speed: 1.8, // animation speed
    intensityMin: 0.3, // flame intensity at smallest marker
    intensityMax: 1.7, // flame intensity at largest marker
    opacity: 0.6 // overall flame opacity
  }
} as const
