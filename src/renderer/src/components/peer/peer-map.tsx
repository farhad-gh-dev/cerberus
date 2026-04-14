import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { SciFiGlobe } from './globe/sci-fi-globe'
import type { GlobeMarker } from './globe/sci-fi-globe'
import type { PeerInfo } from '@shared/types'

interface PeerMapProps {
  peers: PeerInfo[]
  maxBandwidth: number
}

export default function PeerMap({ peers, maxBandwidth }: PeerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<SciFiGlobe | null>(null)
  const peersRef = useRef(peers)
  const maxBandwidthRef = useRef(maxBandwidth)
  const [shouldGroupPeers, setShouldGroupPeers] = useState(true)
  const shouldGroupPeersRef = useRef(shouldGroupPeers)

  peersRef.current = peers
  maxBandwidthRef.current = maxBandwidth
  shouldGroupPeersRef.current = shouldGroupPeers

  // Find the peer with the highest bandwidth
  const topPeer = useMemo(() => {
    let best: PeerInfo | null = null
    let bestBw = -1
    for (const p of peers) {
      if (!p.location) continue
      const bw = p.downloadSpeed + p.uploadSpeed
      if (bw > bestBw) {
        bestBw = bw
        best = p
      }
    }
    return best
  }, [peers])

  const buildMarkers = useCallback((): GlobeMarker[] => {
    const withLocation = peersRef.current.filter((p) => p.location)

    if (!shouldGroupPeersRef.current) {
      // Show individual markers per peer
      return withLocation.map((peer) => {
        const bw = peer.downloadSpeed + peer.uploadSpeed
        const ratio = maxBandwidthRef.current > 0 ? bw / maxBandwidthRef.current : 0
        return {
          lat: peer.location!.lat,
          lon: peer.location!.lon,
          size: Math.min(0.3 + ratio * 1.0, 1.0)
        }
      })
    }

    // Group peers by country
    const countryMap = new Map<
      string,
      { lats: number[]; lons: number[]; totalBw: number; count: number }
    >()

    for (const peer of withLocation) {
      const country = peer.location!.country || `${peer.location!.lat},${peer.location!.lon}`
      const bw = peer.downloadSpeed + peer.uploadSpeed
      const existing = countryMap.get(country)
      if (existing) {
        existing.lats.push(peer.location!.lat)
        existing.lons.push(peer.location!.lon)
        existing.totalBw += bw
        existing.count += 1
      } else {
        countryMap.set(country, {
          lats: [peer.location!.lat],
          lons: [peer.location!.lon],
          totalBw: bw,
          count: 1
        })
      }
    }

    return Array.from(countryMap.values()).map((group) => {
      const avgLat = group.lats.reduce((a, b) => a + b, 0) / group.lats.length
      const avgLon = group.lons.reduce((a, b) => a + b, 0) / group.lons.length
      const ratio = maxBandwidthRef.current > 0 ? group.totalBw / maxBandwidthRef.current : 0
      // Scale size with peer count: more peers = bigger marker
      const countBoost = Math.min(group.count / 5, 1) * 0.3
      return {
        lat: avgLat,
        lon: avgLon,
        size: Math.min(0.3 + ratio * 1.0 + countBoost, 1.0)
      }
    })
  }, [])

  // Initialize globe, focused on top peer
  useEffect(() => {
    if (!containerRef.current) return

    const opts = topPeer?.location
      ? { focusLat: topPeer.location.lat, focusLon: topPeer.location.lon }
      : {}

    const globe = new SciFiGlobe(containerRef.current, opts)
    globeRef.current = globe
    globe.updateMarkers(buildMarkers())

    return () => {
      globe.destroy()
      globeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers and focus when peers or grouping changes
  useEffect(() => {
    if (!globeRef.current) return
    globeRef.current.updateMarkers(buildMarkers())
    if (topPeer?.location) {
      globeRef.current.lookAt(topPeer.location.lat, topPeer.location.lon)
    } else {
      globeRef.current.clearFocus()
    }
  }, [peers, maxBandwidth, topPeer, buildMarkers, shouldGroupPeers])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl bg-[#080810]"
    >
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)] z-10 pointer-events-none" />

      {/* Group toggle */}
      <button
        onClick={() => setShouldGroupPeers((v) => !v)}
        className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur text-xs text-white/80 transition-colors"
      >
        {shouldGroupPeers ? 'Show Individual Peers' : 'Group by Country'}
      </button>
    </div>
  )
}
