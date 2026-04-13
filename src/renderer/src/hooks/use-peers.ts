import { useState, useEffect, useCallback, useMemo } from 'react'
import type { PeerInfo } from '@shared/types'

const POLL_INTERVAL_MS = 2_000

interface PeerStats {
  totalDownSpeed: number
  totalUpSpeed: number
  maxBandwidth: number
  locatedCount: number
}

interface UsePeersResult {
  peers: PeerInfo[]
  stats: PeerStats
  selectedPeer: string | null
  togglePeer: (address: string) => void
  /** Top countries by peer count, sorted descending */
  topCountries: [country: string, count: number][]
  /** True until the first fetch completes */
  loading: boolean
}

export function usePeers(downloadId: string | undefined): UsePeersResult {
  const [peers, setPeers] = useState<PeerInfo[]>([])
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPeers = useCallback(async () => {
    if (!downloadId) return
    try {
      const data = await window.api.download.peers(downloadId)
      setPeers(data)
      // Clear selection if the selected peer left the swarm
      setSelectedPeer((prev) => {
        if (prev && !data.some((p) => p.address === prev)) return null
        return prev
      })
    } catch (err) {
      console.warn('[usePeers] Failed to fetch peers:', err)
    } finally {
      setLoading(false)
    }
  }, [downloadId])

  useEffect(() => {
    setLoading(true)
    fetchPeers()
    const interval = setInterval(fetchPeers, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchPeers])

  const stats = useMemo<PeerStats>(() => {
    let totalDownSpeed = 0
    let totalUpSpeed = 0
    let maxBandwidth = 1
    let locatedCount = 0

    for (const p of peers) {
      totalDownSpeed += p.downloadSpeed
      totalUpSpeed += p.uploadSpeed
      const bw = p.downloadSpeed + p.uploadSpeed
      if (bw > maxBandwidth) maxBandwidth = bw
      if (p.location) locatedCount++
    }

    return { totalDownSpeed, totalUpSpeed, maxBandwidth, locatedCount }
  }, [peers])

  const topCountries = useMemo(() => {
    const countryMap = new Map<string, number>()
    for (const p of peers) {
      if (p.location?.country) {
        countryMap.set(p.location.country, (countryMap.get(p.location.country) || 0) + 1)
      }
    }
    return [...countryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [peers])

  const togglePeer = useCallback((address: string) => {
    setSelectedPeer((prev) => (prev === address ? null : address))
  }, [])

  return { peers, stats, selectedPeer, togglePeer, topCountries, loading }
}
