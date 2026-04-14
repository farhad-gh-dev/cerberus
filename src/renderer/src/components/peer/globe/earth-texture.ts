import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'

import landRaw from 'world-atlas/land-110m.json'

/**
 * Project longitude/latitude to equirectangular canvas coordinates.
 */
function projectToCanvas(
  lon: number,
  lat: number,
  width: number,
  height: number
): [number, number] {
  const x = ((lon + 180) / 360) * width
  const y = ((90 - lat) / 180) * height
  return [x, y]
}

/**
 * Recursively draw any GeoJSON geometry onto a 2D canvas.
 */
function drawGeometry(
  ctx: CanvasRenderingContext2D,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geometry: any,
  width: number,
  height: number
): void {
  switch (geometry.type) {
    case 'Polygon':
      drawPolygonRings(ctx, geometry.coordinates, width, height)
      break
    case 'MultiPolygon':
      for (const polygon of geometry.coordinates) {
        drawPolygonRings(ctx, polygon, width, height)
      }
      break
    case 'GeometryCollection':
      for (const geom of geometry.geometries) {
        drawGeometry(ctx, geom, width, height)
      }
      break
  }
}

/**
 * Draw a polygon (outer ring + holes) and fill using the evenodd rule.
 */
function drawPolygonRings(
  ctx: CanvasRenderingContext2D,
  rings: number[][][],
  width: number,
  height: number
): void {
  ctx.beginPath()
  for (const ring of rings) {
    if (ring.length === 0) continue
    const [sx, sy] = projectToCanvas(ring[0][0], ring[0][1], width, height)
    ctx.moveTo(sx, sy)
    for (let i = 1; i < ring.length; i++) {
      const [x, y] = projectToCanvas(ring[i][0], ring[i][1], width, height)
      ctx.lineTo(x, y)
    }
    ctx.closePath()
  }
  ctx.fill('evenodd')
}

/**
 * Create an equirectangular earth texture canvas.
 * White pixels = land, black pixels = ocean.
 */
export function createEarthCanvas(width = 1024, height = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Ocean background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  // Land fill
  ctx.fillStyle = '#ffffff'

  const topology = landRaw as unknown as Topology
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geojson = feature(topology, topology.objects.land as any)

  // feature() returns Feature or FeatureCollection
  if ('features' in geojson) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const feat of (geojson as any).features) {
      drawGeometry(ctx, feat.geometry, width, height)
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    drawGeometry(ctx, (geojson as any).geometry, width, height)
  }

  return canvas
}
