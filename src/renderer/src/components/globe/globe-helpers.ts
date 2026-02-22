import * as THREE from 'three'
import type { ContinentColors } from './globe-config'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

// Determine continent color from lat/lon
export function getContinentColors(lat: number, lon: number): ContinentColors {
  // North America: lat 15-85, lon -170 to -50
  const isNorthAmerica = lat >= 15 && lat <= 85 && lon >= -170 && lon <= -50

  // South America: lat -56 to 15, lon -82 to -34
  const isSouthAmerica = lat >= -56 && lat < 15 && lon >= -82 && lon <= -34

  // Europe: lat 35-72, lon -10 to 40
  const isEurope = lat >= 35 && lat <= 72 && lon >= -10 && lon <= 40

  // Africa: lat -35 to 37, lon -18 to 52
  const isAfrica = lat >= -35 && lat < 37 && lon >= -18 && lon <= 52

  // Oceania: lat -47 to 0, lon 110 to 180
  const isOceania = lat >= -47 && lat <= 0 && lon >= 110 && lon <= 180

  if (isNorthAmerica) {
    // Green / emerald
    return {
      main: 0x22cc66,
      bright: 0x44ff88,
      glow: 0x11aa44,
      glowRgba: (a) => `rgba(40, 220, 100, ${a})`
    }
  } else if (isSouthAmerica) {
    // Magenta / pink
    return {
      main: 0xcc44aa,
      bright: 0xff66cc,
      glow: 0xaa3388,
      glowRgba: (a) => `rgba(220, 80, 180, ${a})`
    }
  } else if (isEurope) {
    // Cyan / teal
    return {
      main: 0x00cccc,
      bright: 0x00ffff,
      glow: 0x00aacc,
      glowRgba: (a) => `rgba(0, 220, 230, ${a})`
    }
  } else if (isAfrica) {
    // Yellow / gold
    return {
      main: 0xccaa22,
      bright: 0xffdd44,
      glow: 0xaa8811,
      glowRgba: (a) => `rgba(220, 190, 40, ${a})`
    }
  } else if (isOceania) {
    // White / silver
    return {
      main: 0xccccdd,
      bright: 0xffffff,
      glow: 0x9999bb,
      glowRgba: (a) => `rgba(210, 210, 230, ${a})`
    }
  } else {
    // Asia — orange / amber
    return {
      main: 0xee8833,
      bright: 0xffaa44,
      glow: 0xcc6622,
      glowRgba: (a) => `rgba(255, 140, 50, ${a})`
    }
  }
}
