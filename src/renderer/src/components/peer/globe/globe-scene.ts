// ---------------------------------------------------------------------------
// Scene-building helpers — each function adds objects to the given parent
// ---------------------------------------------------------------------------

import * as THREE from 'three'
import { createEarthCanvas } from './earth-texture'
import { GLOBE_CONFIG } from './globe-config'
import {
  DOT_VERTEX,
  DOT_FRAGMENT,
  ATMO_VERTEX,
  ATMO_FRAGMENT,
  BOTTOM_GLOW_VERTEX,
  BOTTOM_GLOW_FRAGMENT
} from './globe-shaders'

/** Dark sphere base */
export function buildBase(parent: THREE.Object3D): void {
  const geo = new THREE.SphereGeometry(1, 64, 64)
  const mat = new THREE.MeshPhongMaterial({
    color: 0x06060f,
    shininess: 5
  })
  parent.add(new THREE.Mesh(geo, mat))
}

/** Dotted land surface rendered via custom shader */
export function buildDottedLand(parent: THREE.Object3D): void {
  const earthCanvas = createEarthCanvas(1024, 512)
  const earthTexture = new THREE.CanvasTexture(earthCanvas)
  earthTexture.wrapS = THREE.RepeatWrapping
  earthTexture.wrapT = THREE.RepeatWrapping

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      earthMap: { value: earthTexture },
      landColor: { value: new THREE.Color(GLOBE_CONFIG.land.color) },
      oceanGridColor: { value: new THREE.Color(GLOBE_CONFIG.land.oceanColor) },
      gridDensity: { value: GLOBE_CONFIG.land.dotDensity },
      dotRadius: { value: GLOBE_CONFIG.land.dotRadius }
    },
    vertexShader: DOT_VERTEX,
    fragmentShader: DOT_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide
  })

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1.002, 128, 64), mat)
  parent.add(mesh)
}

/** Atmospheric glow shell */
export function buildAtmosphere(parent: THREE.Object3D): void {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(GLOBE_CONFIG.atmosphere.color) },
      intensity: { value: GLOBE_CONFIG.atmosphere.intensity }
    },
    vertexShader: ATMO_VERTEX,
    fragmentShader: ATMO_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  })
  parent.add(new THREE.Mesh(new THREE.SphereGeometry(GLOBE_CONFIG.atmosphere.radius, 64, 64), mat))
}

/** Latitude / longitude grid lines */
export function buildGridLines(parent: THREE.Object3D): void {
  const { color, opacity, spacing } = GLOBE_CONFIG.grid
  const r = 1.004

  // Latitude lines
  for (let lat = -60; lat <= 60; lat += spacing) {
    const cosLat = Math.cos((lat * Math.PI) / 180)
    const sinLat = Math.sin((lat * Math.PI) / 180)
    const pts: THREE.Vector3[] = []
    const segs = 120
    for (let i = 0; i <= segs; i++) {
      const angle = (i / segs) * Math.PI * 2
      pts.push(
        new THREE.Vector3(cosLat * Math.cos(angle) * r, sinLat * r, cosLat * Math.sin(angle) * r)
      )
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    parent.add(new THREE.Line(geo, mat))
  }

  // Longitude lines
  for (let lon = 0; lon < 360; lon += spacing) {
    const pts: THREE.Vector3[] = []
    const segs = 120
    for (let i = 0; i <= segs; i++) {
      const latRad = (i / segs) * Math.PI - Math.PI / 2
      pts.push(
        new THREE.Vector3(
          r * Math.cos(latRad) * Math.cos((lon * Math.PI) / 180),
          r * Math.sin(latRad),
          r * Math.cos(latRad) * Math.sin((lon * Math.PI) / 180)
        )
      )
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    parent.add(new THREE.Line(geo, mat))
  }
}

/** Soft glow plane beneath the globe */
export function buildBottomGlow(parent: THREE.Object3D): void {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(GLOBE_CONFIG.bottomGlow.color) }
    },
    vertexShader: BOTTOM_GLOW_VERTEX,
    fragmentShader: BOTTOM_GLOW_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  })
  const s = GLOBE_CONFIG.bottomGlow.size
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(s, s), mat)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = GLOBE_CONFIG.bottomGlow.positionY
  parent.add(plane)
}

/** Ambient, directional, and point lights */
export function buildLights(parent: THREE.Object3D): void {
  const { ambient, directional, point } = GLOBE_CONFIG.lights
  parent.add(new THREE.AmbientLight(ambient.color, ambient.intensity))

  const dir = new THREE.DirectionalLight(directional.color, directional.intensity)
  dir.position.set(directional.position.x, directional.position.y, directional.position.z)
  parent.add(dir)

  const pt = new THREE.PointLight(point.color, point.intensity, point.distance)
  pt.position.set(point.position.x, point.position.y, point.position.z)
  parent.add(pt)
}
