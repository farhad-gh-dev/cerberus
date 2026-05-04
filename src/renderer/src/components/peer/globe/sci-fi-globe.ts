import * as THREE from 'three'
import { GLOBE_CONFIG } from './globe-config'
import type { GlobeMarker, GlobeOptions } from './globe-config'
import type { MarkerEntry } from './globe-markers'
import { createMarkerGroup } from './globe-markers'
import {
  buildBase,
  buildDottedLand,
  buildAtmosphere,
  buildGridLines,
  buildBottomGlow,
  buildLights
} from './globe-scene'

// Re-export types for consumers
export type { GlobeMarker, GlobeOptions }
export { GLOBE_CONFIG }

function disposeMaterial(mat: THREE.Material): void {
  const shaderMat = mat as THREE.ShaderMaterial
  if (shaderMat.uniforms) {
    for (const key of Object.keys(shaderMat.uniforms)) {
      const value = shaderMat.uniforms[key]?.value as THREE.Texture | undefined
      if (value && (value as THREE.Texture).isTexture) value.dispose()
    }
  }
  const map = (mat as THREE.SpriteMaterial | THREE.MeshBasicMaterial).map
  if (map && map.isTexture) map.dispose()
  mat.dispose()
}

function disposeObject(root: THREE.Object3D): void {
  root.traverse((node) => {
    const geom = (node as THREE.Mesh | THREE.Line).geometry
    if (geom && typeof geom.dispose === 'function') geom.dispose()

    const mat = (node as THREE.Mesh | THREE.Line | THREE.Sprite).material as
      | THREE.Material
      | THREE.Material[]
      | undefined
    if (Array.isArray(mat)) mat.forEach(disposeMaterial)
    else if (mat) disposeMaterial(mat)
  })
}

// ---------------------------------------------------------------------------
// Globe class
// ---------------------------------------------------------------------------

export class SciFiGlobe {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private globeGroup: THREE.Group
  private markerGroup: THREE.Group
  private targetRotationY: number | null = null
  private targetRotationX: number = GLOBE_CONFIG.globe.tiltX
  private readonly baseTiltX = GLOBE_CONFIG.globe.tiltX
  private currentLookAtY: number = GLOBE_CONFIG.camera.lookAt.y
  private targetLookAtY: number = GLOBE_CONFIG.camera.lookAt.y
  private currentPosY: number = GLOBE_CONFIG.camera.position.y
  private targetPosY: number = GLOBE_CONFIG.camera.position.y
  private idleSpeed = GLOBE_CONFIG.globe.idleSpeed
  private animationId = 0
  private isDestroyed = false
  private resizeObserver: ResizeObserver | null = null
  private markerScales: Map<string, MarkerEntry> = new Map()
  private existingMarkerKeys: Set<string> = new Set()
  private flameTime = 0

  constructor(
    private container: HTMLElement,
    options: GlobeOptions = {}
  ) {
    // ---- Scene ----
    this.scene = new THREE.Scene()

    // ---- Camera ----
    const { camera: cam } = GLOBE_CONFIG
    const aspect = container.clientWidth / container.clientHeight
    this.camera = new THREE.PerspectiveCamera(cam.fov, aspect, 0.1, 100)
    this.camera.position.set(cam.position.x, cam.position.y, cam.position.z)
    this.camera.lookAt(cam.lookAt.x, cam.lookAt.y, cam.lookAt.z)

    // ---- Renderer ----
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setClearColor(0x000000, 0)
    container.appendChild(this.renderer.domElement)

    // ---- Groups ----
    this.globeGroup = new THREE.Group()
    this.markerGroup = new THREE.Group()
    this.globeGroup.add(this.markerGroup)
    this.scene.add(this.globeGroup)

    // Axial tilt
    this.globeGroup.rotation.x = GLOBE_CONFIG.globe.tiltX

    // Set initial focus if provided, otherwise idle-rotate
    if (options.focusLat !== undefined && options.focusLon !== undefined) {
      this.targetRotationY = -((options.focusLon + 90) * Math.PI) / 180
      this.globeGroup.rotation.y = this.targetRotationY
    } else {
      this.targetRotationY = null
    }

    // ---- Build the scene ----
    buildBase(this.globeGroup)
    buildDottedLand(this.globeGroup)
    buildAtmosphere(this.globeGroup)
    buildGridLines(this.globeGroup)
    buildBottomGlow(this.scene)
    buildLights(this.scene)

    // ---- Animate ----
    this.animate()

    // ---- Resize ----
    this.resizeObserver = new ResizeObserver(() => {
      const w = this.container.clientWidth
      const h = this.container.clientHeight
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h)
    })
    this.resizeObserver.observe(container)
  }

  // -----------------------------------------------------------------------
  // Animation
  // -----------------------------------------------------------------------

  private animate = (): void => {
    if (this.isDestroyed) return
    this.animationId = requestAnimationFrame(this.animate)

    if (this.targetRotationY === null) {
      this.globeGroup.rotation.y += this.idleSpeed
    } else {
      const diffY = this.targetRotationY - this.globeGroup.rotation.y
      if (Math.abs(diffY) > 0.001) {
        this.globeGroup.rotation.y += diffY * GLOBE_CONFIG.globe.lerpSpeed
      } else {
        this.globeGroup.rotation.y = this.targetRotationY
      }
    }

    const diffX = this.targetRotationX - this.globeGroup.rotation.x
    if (Math.abs(diffX) > 0.001) {
      this.globeGroup.rotation.x += diffX * GLOBE_CONFIG.globe.lerpSpeed
    } else {
      this.globeGroup.rotation.x = this.targetRotationX
    }

    const diffPosY = this.targetPosY - this.currentPosY
    if (Math.abs(diffPosY) > 0.001) {
      this.currentPosY += diffPosY * GLOBE_CONFIG.globe.lerpSpeed
      this.camera.position.y = this.currentPosY
    }

    const diffLookY = this.targetLookAtY - this.currentLookAtY
    if (Math.abs(diffLookY) > 0.001 || Math.abs(diffPosY) > 0.001) {
      this.currentLookAtY += diffLookY * GLOBE_CONFIG.globe.lerpSpeed
      const { lookAt: la } = GLOBE_CONFIG.camera
      this.camera.lookAt(la.x, this.currentLookAtY, la.z)
    }

    // Animate markers
    for (const entry of this.markerScales.values()) {
      const diff = entry.target - entry.current
      if (Math.abs(diff) > 0.001) {
        entry.current += diff * GLOBE_CONFIG.markers.scaleInSpeed
        if (Math.abs(entry.target - entry.current) < 0.001) entry.current = entry.target
        entry.group.scale.setScalar(entry.current)
      }

      const flameDiff = entry.flameTargetIntensity - entry.flameIntensity
      if (Math.abs(flameDiff) > 0.001) {
        entry.flameIntensity += flameDiff * 0.08
      }

      for (const mat of entry.flameMaterials) {
        mat.uniforms.uTime.value = this.flameTime
        mat.uniforms.uIntensity.value = entry.flameIntensity
      }
    }

    this.flameTime += 0.016 * GLOBE_CONFIG.flame.speed
    this.renderer.render(this.scene, this.camera)
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  lookAt(lat: number, lon: number): void {
    this.targetRotationY = -((lon + 90) * Math.PI) / 180
    const latRad = (lat * Math.PI) / 180
    this.targetRotationX = this.baseTiltX + latRad * GLOBE_CONFIG.globe.latTiltFactor
    this.targetLookAtY =
      lat >= 0 ? Math.abs(GLOBE_CONFIG.camera.lookAt.y) : -Math.abs(GLOBE_CONFIG.camera.lookAt.y)
    this.targetPosY = lat >= 0 ? -0.2 : 0.2
  }

  clearFocus(): void {
    this.targetRotationY = null
    this.targetRotationX = this.baseTiltX
    this.targetLookAtY = GLOBE_CONFIG.camera.lookAt.y
    this.targetPosY = GLOBE_CONFIG.camera.position.y
  }

  updateMarkers(markers: GlobeMarker[]): void {
    const newKeys = new Set(markers.map((m) => `${m.lat.toFixed(2)},${m.lon.toFixed(2)}`))

    // Remove stale markers
    for (const key of this.existingMarkerKeys) {
      if (!newKeys.has(key)) {
        const entry = this.markerScales.get(key)
        if (entry) {
          this.markerGroup.remove(entry.group)
          disposeObject(entry.group)
          this.markerScales.delete(key)
        }
      }
    }

    for (const { lat, lon, size } of markers) {
      const key = `${lat.toFixed(2)},${lon.toFixed(2)}`

      // Update existing marker scale if size changed
      if (this.existingMarkerKeys.has(key)) {
        const entry = this.markerScales.get(key)
        if (entry && Math.abs(entry.origSize - size) > 0.001) {
          const mc = GLOBE_CONFIG.markers
          const origBaseScale = mc.baseScaleMin + entry.origSize * mc.baseScaleMax
          const newBaseScale = mc.baseScaleMin + size * mc.baseScaleMax
          entry.target = newBaseScale / origBaseScale
          const fc = GLOBE_CONFIG.flame
          entry.flameTargetIntensity = fc.intensityMin + size * (fc.intensityMax - fc.intensityMin)
        }
        continue
      }

      // Create new marker
      const entry = createMarkerGroup(lat, lon, size, this.flameTime)
      this.markerScales.set(key, entry)
      this.markerGroup.add(entry.group)
    }

    this.existingMarkerKeys = newKeys
  }

  destroy(): void {
    this.isDestroyed = true
    cancelAnimationFrame(this.animationId)
    this.resizeObserver?.disconnect()

    disposeObject(this.scene)

    this.renderer.dispose()
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement)
    }
  }
}
