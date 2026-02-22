import axios from 'axios'
import type { PeerLocation } from '../../shared/types'

// In-memory cache to avoid re-fetching the same IP
const cache = new Map<string, PeerLocation | null>()

// Batch queue for ip-api.com (supports up to 100 IPs per batch request)
let batchQueue: { ip: string; resolve: (loc: PeerLocation | null) => void }[] = []
let batchTimer: ReturnType<typeof setTimeout> | null = null

function processBatch(): void {
  const batch = batchQueue.splice(0, 100)
  if (batch.length === 0) return

  const ips = batch.map((b) => b.ip)

  axios
    .post('http://ip-api.com/batch?fields=lat,lon,city,country,countryCode,isp,query,status', ips)
    .then((res) => {
      const results = res.data as Array<{
        status: string
        query: string
        lat?: number
        lon?: number
        city?: string
        country?: string
        countryCode?: string
        isp?: string
      }>

      const resultMap = new Map<string, PeerLocation | null>()
      for (const r of results) {
        if (r.status === 'success' && r.lat !== undefined && r.lon !== undefined) {
          const loc: PeerLocation = {
            lat: r.lat,
            lon: r.lon,
            city: r.city || '',
            country: r.country || '',
            countryCode: r.countryCode || '',
            isp: r.isp || ''
          }
          resultMap.set(r.query, loc)
          cache.set(r.query, loc)
        } else {
          resultMap.set(r.query, null)
          cache.set(r.query, null)
        }
      }

      for (const b of batch) {
        b.resolve(resultMap.get(b.ip) ?? null)
      }
    })
    .catch(() => {
      for (const b of batch) {
        b.resolve(null)
      }
    })
}

export function geolocateIp(ip: string): Promise<PeerLocation | null> {
  // Strip IPv6-mapped IPv4 prefix
  const cleanIp = ip.replace(/^::ffff:/, '')

  // Skip private/local IPs
  if (
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('192.168.') ||
    cleanIp.startsWith('127.') ||
    cleanIp === '::1' ||
    (cleanIp.startsWith('172.') &&
      (() => {
        const second = parseInt(cleanIp.split('.')[1], 10)
        return second >= 16 && second <= 31
      })())
  ) {
    return Promise.resolve(null)
  }

  if (cache.has(cleanIp)) {
    return Promise.resolve(cache.get(cleanIp) ?? null)
  }

  return new Promise((resolve) => {
    batchQueue.push({ ip: cleanIp, resolve })

    // Debounce: wait 200ms to collect more IPs, then send batch
    if (batchTimer) clearTimeout(batchTimer)
    batchTimer = setTimeout(() => {
      batchTimer = null
      processBatch()
    }, 200)
  })
}

export async function geolocateBatch(ips: string[]): Promise<Map<string, PeerLocation | null>> {
  const results = await Promise.all(ips.map(async (ip) => [ip, await geolocateIp(ip)] as const))
  return new Map(results)
}
