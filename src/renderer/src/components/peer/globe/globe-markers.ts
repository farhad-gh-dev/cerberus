// ---------------------------------------------------------------------------
// Marker construction — builds a single peer-marker THREE.Group
// ---------------------------------------------------------------------------

import * as THREE from 'three'
import { GLOBE_CONFIG } from './globe-config'
import type { ContinentColors } from './globe-config'
import { latLonToVec3, getContinentColors } from './globe-helpers'
import { FLAME_VERTEX, FLAME_FRAGMENT } from './globe-shaders'

/** Data returned alongside the marker group for animation tracking */
export interface MarkerEntry {
  group: THREE.Group
  current: number
  target: number
  origSize: number
  flameMaterials: THREE.ShaderMaterial[]
  flameIntensity: number
  flameTargetIntensity: number
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildBaseRing(
  group: THREE.Group,
  baseScale: number,
  spikeStart: number,
  colors: ContinentColors
): void {
  const mc = GLOBE_CONFIG.markers
  const dotGeo = new THREE.RingGeometry(
    baseScale * mc.baseRing.innerRadius,
    baseScale * mc.baseRing.outerRadius,
    24
  )
  const dotMat = new THREE.MeshBasicMaterial({
    color: colors.main,
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide
  })
  const dot = new THREE.Mesh(dotGeo, dotMat)
  dot.position.z = spikeStart
  group.add(dot)
}

function buildStackedRings(group: THREE.Group, baseScale: number, colors: ContinentColors): void {
  const mc = GLOBE_CONFIG.markers
  for (let i = 0; i < mc.ringCount; i++) {
    const height = i * baseScale * mc.ringLevelSpacing
    const radius = baseScale * mc.ringRadius

    // Solid ring
    const ringGeo = new THREE.RingGeometry(radius * mc.ringThickness, radius, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: colors.main,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.z = height
    group.add(ring)

    // Inner glow
    const innerGlowGeo = new THREE.CircleGeometry(radius * mc.innerGlowRadius, 48)
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: colors.main,
      transparent: true,
      opacity: mc.innerGlowOpacity,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat)
    innerGlow.position.z = height
    group.add(innerGlow)
  }
}

function buildSpike(
  group: THREE.Group,
  baseScale: number,
  spikeStart: number,
  totalHeight: number,
  colors: ContinentColors
): void {
  const mc = GLOBE_CONFIG.markers
  const spikeLength = totalHeight - spikeStart
  const spikeRadius = baseScale * mc.spikeRadius
  const spikeGeo = new THREE.CylinderGeometry(spikeRadius, spikeRadius, spikeLength, 8)
  spikeGeo.rotateX(Math.PI / 2)
  const spikeMat = new THREE.MeshBasicMaterial({
    color: colors.bright,
    transparent: true,
    opacity: mc.spikeOpacity
  })
  const spike = new THREE.Mesh(spikeGeo, spikeMat)
  spike.position.z = spikeStart + spikeLength / 2
  group.add(spike)
}

function buildTipGlow(
  group: THREE.Group,
  baseScale: number,
  totalHeight: number,
  colors: ContinentColors
): void {
  const mc = GLOBE_CONFIG.markers

  // Tiny bright core
  const tipCoreGeo = new THREE.SphereGeometry(baseScale * mc.tipCoreRadius, 8, 8)
  const tipCoreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  const tipCore = new THREE.Mesh(tipCoreGeo, tipCoreMat)
  tipCore.position.set(0, 0, totalHeight)
  group.add(tipCore)

  // Glow sprite (radial gradient)
  const glowCanvas = document.createElement('canvas')
  glowCanvas.width = 128
  glowCanvas.height = 128
  const ctx = glowCanvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  for (let s = 0; s < mc.glowGradientStops.length; s++) {
    gradient.addColorStop(mc.glowGradientStops[s], colors.glowRgba(mc.glowGradientAlphas[s]))
  }
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)

  const glowTexture = new THREE.CanvasTexture(glowCanvas)
  const glowSpriteMat = new THREE.SpriteMaterial({
    map: glowTexture,
    color: colors.glow,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false
  })
  const glowSprite = new THREE.Sprite(glowSpriteMat)
  glowSprite.position.set(0, 0, totalHeight)
  glowSprite.scale.set(baseScale * mc.glowSpriteSize, baseScale * mc.glowSpriteSize, 1)
  group.add(glowSprite)
}

function buildFlame(
  group: THREE.Group,
  baseScale: number,
  size: number,
  flameTime: number,
  colors: ContinentColors
): { flameMaterials: THREE.ShaderMaterial[]; flameIntensity: number } {
  const fc = GLOBE_CONFIG.flame
  const flameMaterials: THREE.ShaderMaterial[] = []

  if (!fc.enabled) {
    return { flameMaterials, flameIntensity: 0 }
  }

  const flameW = baseScale * fc.widthFactor
  const flameH = baseScale * fc.heightFactor
  const flameIntensity = fc.intensityMin + size * (fc.intensityMax - fc.intensityMin)

  // Flame colors derived from continent colors but shifted toward blue/white
  const mainColor = new THREE.Color(colors.main)
  const brightColor = new THREE.Color(colors.bright)
  const flameColorBase = new THREE.Color().copy(brightColor).lerp(new THREE.Color(0xffffff), 0.5)
  const flameColorMid = new THREE.Color().copy(mainColor).lerp(new THREE.Color(0x4488ff), 0.3)
  const flameColorOuter = new THREE.Color().copy(mainColor).lerp(new THREE.Color(0x000022), 0.5)

  const flameMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: flameTime },
      uIntensity: { value: flameIntensity },
      uColorBase: { value: flameColorBase },
      uColorMid: { value: flameColorMid },
      uColorOuter: { value: flameColorOuter },
      uOpacity: { value: fc.opacity }
    },
    vertexShader: FLAME_VERTEX,
    fragmentShader: FLAME_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  })
  flameMaterials.push(flameMat)

  const flameGeo = new THREE.PlaneGeometry(flameW, flameH)
  const flameMesh = new THREE.Mesh(flameGeo, flameMat)
  flameMesh.rotation.x = Math.PI / 2
  flameMesh.position.z = flameH * 0.5
  group.add(flameMesh)

  return { flameMaterials, flameIntensity }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a complete marker THREE.Group for a given peer location.
 * Returns a MarkerEntry ready for animation tracking.
 */
export function createMarkerGroup(
  lat: number,
  lon: number,
  size: number,
  flameTime: number
): MarkerEntry {
  const mc = GLOBE_CONFIG.markers
  const pos = latLonToVec3(lat, lon, mc.surfaceRadius)
  const baseScale = mc.baseScaleMin + size * mc.baseScaleMax
  const totalHeight = baseScale * mc.spikeHeightFactor + size * mc.spikeHeightSizeBoost
  const spikeStart = baseScale * mc.spikeStartFactor
  const colors = getContinentColors(lat, lon)

  // Group oriented so local +Z = outward from globe surface
  const group = new THREE.Group()
  group.position.copy(pos)
  group.lookAt(pos.clone().multiplyScalar(2))

  buildBaseRing(group, baseScale, spikeStart, colors)
  buildStackedRings(group, baseScale, colors)
  buildSpike(group, baseScale, spikeStart, totalHeight, colors)
  buildTipGlow(group, baseScale, totalHeight, colors)

  const { flameMaterials, flameIntensity } = buildFlame(group, baseScale, size, flameTime, colors)

  // Start at scale 0 for animate-in
  group.scale.setScalar(0)

  return {
    group,
    current: 0,
    target: 1,
    origSize: size,
    flameMaterials,
    flameIntensity,
    flameTargetIntensity: flameIntensity
  }
}
