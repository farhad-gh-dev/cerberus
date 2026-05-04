import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Pause, RotateCcw, X, Globe, MoreHorizontal } from 'lucide-react'
import SpeedChart from '../components/speed-chart'
import type { PeerInfo } from '@shared/types'

/** Get flag image URL from country code */
function flagUrl(code: string): string {
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`
}

const formatSpeed = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B/s`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`
}

/** Generate mock peers for preview */
function generateMockPeers(): PeerInfo[] {
  const countries = [
    {
      code: 'US',
      country: 'United States',
      city: 'New York',
      isp: 'Comcast',
      lat: 40.71,
      lon: -74.01
    },
    {
      code: 'DE',
      country: 'Germany',
      city: 'Berlin',
      isp: 'Deutsche Telekom',
      lat: 52.52,
      lon: 13.41
    },
    { code: 'JP', country: 'Japan', city: 'Tokyo', isp: 'NTT', lat: 35.68, lon: 139.69 },
    { code: 'BR', country: 'Brazil', city: 'São Paulo', isp: 'Vivo', lat: -23.55, lon: -46.63 },
    { code: 'GB', country: 'United Kingdom', city: 'London', isp: 'BT', lat: 51.51, lon: -0.13 },
    { code: 'FR', country: 'France', city: 'Paris', isp: 'Orange', lat: 48.86, lon: 2.35 }
  ]

  return countries.map((loc, i) => ({
    id: `mock-${i}`,
    address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    port: 6881 + i,
    client: [
      'qBittorrent 4.6',
      'Transmission 4.0',
      'Deluge 2.1',
      'libtorrent 2.0',
      'µTorrent 3.6',
      'Vuze 5.7'
    ][i],
    downloadSpeed: Math.random() > 0.3 ? Math.floor(Math.random() * 3_000_000) : 0,
    uploadSpeed: Math.random() > 0.5 ? Math.floor(Math.random() * 500_000) : 0,
    downloaded: Math.floor(Math.random() * 100_000_000),
    uploaded: Math.floor(Math.random() * 50_000_000),
    progress: Math.random(),
    location: {
      lat: loc.lat,
      lon: loc.lon,
      city: loc.city,
      country: loc.country,
      countryCode: loc.code,
      isp: loc.isp
    }
  }))
}

export default function ChartPreview() {
  const navigate = useNavigate()
  const [running, setRunning] = useState(true)
  const [downloadSpeed, setDownloadSpeed] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState(0)
  const [peers] = useState<PeerInfo[]>(() => generateMockPeers())
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef(0)

  const tick = useCallback(() => {
    tickRef.current++
    const t = tickRef.current

    // Simulate realistic-ish speed curves
    const baseDown = 2_000_000 // ~2 MB/s base
    const baseUp = 500_000 // ~500 KB/s base

    // Add some sine waves + noise for organic movement
    const downWave =
      Math.sin(t * 0.15) * 800_000 + Math.sin(t * 0.07) * 1_200_000 + Math.sin(t * 0.31) * 400_000
    const upWave =
      Math.sin(t * 0.12 + 1) * 200_000 +
      Math.sin(t * 0.05 + 2) * 300_000 +
      Math.sin(t * 0.25 + 0.5) * 100_000

    // Random noise
    const downNoise = (Math.random() - 0.5) * 600_000
    const upNoise = (Math.random() - 0.5) * 150_000

    // Occasional bursts
    const burst = Math.random() > 0.9 ? Math.random() * 3_000_000 : 0

    setDownloadSpeed(Math.max(0, baseDown + downWave + downNoise + burst))
    setUploadSpeed(Math.max(0, baseUp + upWave + upNoise))
  }, [])

  useEffect(() => {
    if (running) {
      // Initial tick
      tick()
      intervalRef.current = setInterval(tick, 2000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, tick])

  const handleReset = () => {
    tickRef.current = 0
    setDownloadSpeed(0)
    setUploadSpeed(0)
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B/s`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`
  }

  return (
    <div className="h-full flex bg-custom-100 dark:bg-custom-900">
      {/* Left sidebar — peer cards preview */}
      <div className="w-1/3 border-r border-custom-200 dark:border-custom-700/60 flex flex-col min-h-0">
        {/* Header: close button left, title right */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 relative z-[60] [-webkit-app-region:no-drag]">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-custom-50 text-custom-500 hover:text-custom-800 transition-colors dark:bg-transparent dark:text-custom-400 dark:hover:bg-custom-700 dark:hover:text-custom-50"
          >
            <X size={14} />
          </button>
          <h1 className="text-sm font-semibold text-custom-800 dark:text-custom-50 truncate ml-3">
            Preview Movie
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-custom-200 dark:border-custom-700/60">
          <button
            onClick={() => setRunning(!running)}
            className="flex items-center gap-2 rounded-lg border border-custom-200 bg-custom-50 px-3 py-1.5 text-xs text-custom-700 transition-colors hover:bg-custom-100 dark:border-custom-700 dark:bg-custom-800/30 dark:text-custom-200 dark:hover:bg-custom-700/50"
          >
            {running ? <Pause size={12} /> : <Play size={12} />}
            {running ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-custom-200 bg-custom-50 px-3 py-1.5 text-xs text-custom-700 transition-colors hover:bg-custom-100 dark:border-custom-700 dark:bg-custom-800/30 dark:text-custom-200 dark:hover:bg-custom-700/50"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>

        {/* Peer cards */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {[...peers]
            .sort((a, b) => b.downloadSpeed + b.uploadSpeed - (a.downloadSpeed + a.uploadSpeed))
            .map((peer) => {
              const isActive = peer.downloadSpeed > 0 || peer.uploadSpeed > 0

              return (
                <div
                  key={peer.id}
                  className="rounded-2xl border border-custom-200 bg-custom-50/60 p-4 transition-colors hover:border-custom-300 dark:border-custom-700/60 dark:bg-custom-800/60 dark:hover:border-custom-700"
                >
                  {/* Top row: flag + address + dots */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-custom-200 flex items-center justify-center shrink-0 border border-custom-300/60 overflow-hidden dark:bg-custom-800 dark:border-custom-700/50">
                      {peer.location?.countryCode ? (
                        <img
                          src={flagUrl(peer.location.countryCode)}
                          alt={peer.location.countryCode}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Globe size={16} className="text-custom-500 dark:text-custom-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-custom-800 dark:text-custom-50 truncate">
                        {peer.address}
                      </p>
                      <p className="text-[11px] text-custom-500 dark:text-custom-400 truncate">
                        {peer.location
                          ? `${peer.location.city}${peer.location.city && peer.location.country ? ', ' : ''}${peer.location.country}`
                          : peer.client || 'Unknown location'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPeer(selectedPeer === peer.id ? null : peer.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-custom-500 transition-colors hover:bg-custom-100 hover:text-custom-800 dark:text-custom-400 dark:hover:bg-custom-700 dark:hover:text-custom-100 shrink-0"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  {/* Bottom row: status badge + speeds */}
                  <div className="flex items-center justify-between mt-5">
                    <span
                      className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-yellow-500/15 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'
                          : 'bg-custom-200 text-custom-500 dark:bg-custom-800 dark:text-custom-400'
                      }`}
                    >
                      {isActive ? 'Active' : 'Idle'}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-custom-500 dark:text-custom-400">Down</p>
                        <p className="text-sm font-semibold text-green-500 dark:text-green-400">
                          {peer.downloadSpeed > 0 ? formatSpeed(peer.downloadSpeed) : '--'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-custom-500 dark:text-custom-400">Up</p>
                        <p className="text-sm font-semibold text-blue-500 dark:text-blue-400">
                          {peer.uploadSpeed > 0 ? formatSpeed(peer.uploadSpeed) : '--'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {selectedPeer === peer.id && (
                    <div className="mt-3 pt-3 border-t border-custom-200 dark:border-custom-700/50 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
                      <div>
                        <span className="text-custom-500 dark:text-custom-500">Port: </span>
                        <span className="text-custom-700 dark:text-custom-300">{peer.port}</span>
                      </div>
                      <div>
                        <span className="text-custom-500 dark:text-custom-500">Client: </span>
                        <span className="text-custom-700 dark:text-custom-300">{peer.client}</span>
                      </div>
                      {peer.location && (
                        <>
                          <div>
                            <span className="text-custom-500 dark:text-custom-500">ISP: </span>
                            <span className="text-custom-700 dark:text-custom-300">
                              {peer.location.isp}
                            </span>
                          </div>
                          <div>
                            <span className="text-custom-500 dark:text-custom-500">Coords: </span>
                            <span className="text-custom-700 dark:text-custom-300">
                              {peer.location.lat.toFixed(2)}, {peer.location.lon.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-custom-200 dark:border-custom-700/60 text-[10px] text-custom-500 dark:text-custom-500 flex items-center gap-1.5">
          <Globe size={10} />
          {peers.filter((p) => p.location).length} of {peers.length} peers geolocated
        </div>
      </div>

      {/* Right panel — chart */}
      <div className="w-2/3 flex flex-col p-6 gap-6">
        {/* Current speeds */}
        <div className="flex gap-4">
          <div className="rounded-xl border border-custom-200 bg-custom-50/60 p-4 flex-1 dark:border-custom-700/60 dark:bg-custom-800/60">
            <p className="text-[10px] uppercase tracking-wider text-custom-500 dark:text-custom-400 mb-1">
              Download
            </p>
            <p className="text-xl font-bold text-green-500 dark:text-green-400">
              {formatBytes(downloadSpeed)}
            </p>
          </div>
          <div className="rounded-xl border border-custom-200 bg-custom-50/60 p-4 flex-1 dark:border-custom-700/60 dark:bg-custom-800/60">
            <p className="text-[10px] uppercase tracking-wider text-custom-500 dark:text-custom-400 mb-1">
              Upload
            </p>
            <p className="text-xl font-bold text-blue-500 dark:text-blue-400">
              {formatBytes(uploadSpeed)}
            </p>
          </div>
        </div>

        {/* Chart — large preview */}
        <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-custom-200 dark:border-custom-700/60 bg-custom-50/60 dark:bg-[#0a0a12]">
          <SpeedChart downloadSpeed={downloadSpeed} uploadSpeed={uploadSpeed} />
        </div>
      </div>
    </div>
  )
}
