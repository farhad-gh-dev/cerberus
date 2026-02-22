import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'
import PeerMap from '../components/peer-map'
import type { PeerInfo } from '@shared/types'

// Pool of possible peers that can join/leave the swarm
const PEER_POOL: PeerInfo[] = [
  {
    id: 'p1',
    address: '72.14.207.99',
    port: 51413,
    client: 'Transmission/3.00',
    downloadSpeed: 1200000,
    uploadSpeed: 300000,
    downloaded: 50000000,
    uploaded: 10000000,
    progress: 0.6,
    location: {
      lat: 37.7749,
      lon: -122.4194,
      city: 'San Francisco',
      country: 'US',
      countryCode: 'US',
      isp: 'Google'
    }
  },
  {
    id: 'p2',
    address: '194.171.25.10',
    port: 6881,
    client: 'qBittorrent/4.5.2',
    downloadSpeed: 800000,
    uploadSpeed: 500000,
    downloaded: 30000000,
    uploaded: 20000000,
    progress: 0.8,
    location: {
      lat: 51.5074,
      lon: -0.1278,
      city: 'London',
      country: 'GB',
      countryCode: 'GB',
      isp: 'BT'
    }
  },
  {
    id: 'p2b',
    address: '81.134.60.22',
    port: 6890,
    client: 'Deluge/2.1.1',
    downloadSpeed: 650000,
    uploadSpeed: 200000,
    downloaded: 22000000,
    uploaded: 9000000,
    progress: 0.45,
    location: {
      lat: 53.4808,
      lon: -2.2426,
      city: 'Manchester',
      country: 'GB',
      countryCode: 'GB',
      isp: 'Virgin Media'
    }
  },
  {
    id: 'p3',
    address: '103.22.200.5',
    port: 6882,
    client: 'Deluge/2.1.1',
    downloadSpeed: 500000,
    uploadSpeed: 100000,
    downloaded: 20000000,
    uploaded: 5000000,
    progress: 0.4,
    location: {
      lat: 35.6762,
      lon: 139.6503,
      city: 'Tokyo',
      country: 'JP',
      countryCode: 'JP',
      isp: 'NTT'
    }
  },
  {
    id: 'p4',
    address: '200.147.35.11',
    port: 6883,
    client: 'uTorrent/3.5.5',
    downloadSpeed: 300000,
    uploadSpeed: 300000,
    downloaded: 15000000,
    uploaded: 12000000,
    progress: 0.3,
    location: {
      lat: -23.5505,
      lon: -46.6333,
      city: 'São Paulo',
      country: 'BR',
      countryCode: 'BR',
      isp: 'Telefonica'
    }
  },
  {
    id: 'p5',
    address: '41.203.18.100',
    port: 51420,
    client: 'Vuze/5.7',
    downloadSpeed: 200000,
    uploadSpeed: 50000,
    downloaded: 8000000,
    uploaded: 2000000,
    progress: 0.2,
    location: {
      lat: -1.2921,
      lon: 36.8219,
      city: 'Nairobi',
      country: 'KE',
      countryCode: 'KE',
      isp: 'Safaricom'
    }
  },
  {
    id: 'p6',
    address: '109.252.45.3',
    port: 6881,
    client: 'libtorrent/2.0',
    downloadSpeed: 900000,
    uploadSpeed: 400000,
    downloaded: 40000000,
    uploaded: 18000000,
    progress: 0.7,
    location: {
      lat: 55.7558,
      lon: 37.6173,
      city: 'Moscow',
      country: 'RU',
      countryCode: 'RU',
      isp: 'Rostelecom'
    }
  },
  {
    id: 'p7',
    address: '175.45.176.1',
    port: 6884,
    client: 'BitTorrent/7.11',
    downloadSpeed: 400000,
    uploadSpeed: 150000,
    downloaded: 18000000,
    uploaded: 8000000,
    progress: 0.5,
    location: {
      lat: -33.8688,
      lon: 151.2093,
      city: 'Sydney',
      country: 'AU',
      countryCode: 'AU',
      isp: 'Telstra'
    }
  },
  {
    id: 'p8',
    address: '49.207.53.22',
    port: 6885,
    client: 'Transmission/4.0',
    downloadSpeed: 600000,
    uploadSpeed: 250000,
    downloaded: 25000000,
    uploaded: 14000000,
    progress: 0.55,
    location: {
      lat: 19.076,
      lon: 72.8777,
      city: 'Mumbai',
      country: 'IN',
      countryCode: 'IN',
      isp: 'Jio'
    }
  },
  {
    id: 'p9',
    address: '82.64.123.45',
    port: 51413,
    client: 'rTorrent/0.9.8',
    downloadSpeed: 1100000,
    uploadSpeed: 600000,
    downloaded: 48000000,
    uploaded: 30000000,
    progress: 0.85,
    location: {
      lat: 48.8566,
      lon: 2.3522,
      city: 'Paris',
      country: 'FR',
      countryCode: 'FR',
      isp: 'Free'
    }
  },
  {
    id: 'p10',
    address: '156.154.100.3',
    port: 6881,
    client: 'qBittorrent/4.6.0',
    downloadSpeed: 700000,
    uploadSpeed: 350000,
    downloaded: 35000000,
    uploaded: 16000000,
    progress: 0.65,
    location: {
      lat: 30.0444,
      lon: 31.2357,
      city: 'Cairo',
      country: 'EG',
      countryCode: 'EG',
      isp: 'TE Data'
    }
  },
  {
    id: 'p11',
    address: '185.86.151.11',
    port: 6881,
    client: 'Transmission/3.00',
    downloadSpeed: 950000,
    uploadSpeed: 420000,
    downloaded: 42000000,
    uploaded: 19000000,
    progress: 0.72,
    location: {
      lat: 52.52,
      lon: 13.405,
      city: 'Berlin',
      country: 'DE',
      countryCode: 'DE',
      isp: 'Deutsche Telekom'
    }
  },
  {
    id: 'p12',
    address: '45.33.32.156',
    port: 51413,
    client: 'qBittorrent/4.5.2',
    downloadSpeed: 1050000,
    uploadSpeed: 380000,
    downloaded: 46000000,
    uploaded: 22000000,
    progress: 0.78,
    location: {
      lat: 40.7128,
      lon: -74.006,
      city: 'New York',
      country: 'US',
      countryCode: 'US',
      isp: 'Verizon'
    }
  },
  {
    id: 'p13',
    address: '91.189.94.40',
    port: 6882,
    client: 'libtorrent/2.0',
    downloadSpeed: 780000,
    uploadSpeed: 310000,
    downloaded: 33000000,
    uploaded: 15000000,
    progress: 0.62,
    location: {
      lat: 59.3293,
      lon: 18.0686,
      city: 'Stockholm',
      country: 'SE',
      countryCode: 'SE',
      isp: 'Telia'
    }
  },
  {
    id: 'p14',
    address: '168.195.100.7',
    port: 6884,
    client: 'uTorrent/3.5.5',
    downloadSpeed: 420000,
    uploadSpeed: 180000,
    downloaded: 19000000,
    uploaded: 11000000,
    progress: 0.38,
    location: {
      lat: -34.6037,
      lon: -58.3816,
      city: 'Buenos Aires',
      country: 'AR',
      countryCode: 'AR',
      isp: 'Telecom Argentina'
    }
  },
  {
    id: 'p15',
    address: '119.29.29.29',
    port: 6881,
    client: 'BitTorrent/7.11',
    downloadSpeed: 880000,
    uploadSpeed: 260000,
    downloaded: 38000000,
    uploaded: 17000000,
    progress: 0.58,
    location: {
      lat: 31.2304,
      lon: 121.4737,
      city: 'Shanghai',
      country: 'CN',
      countryCode: 'CN',
      isp: 'China Telecom'
    }
  }
]

/** Randomize a peer's speeds: drastic jitter for visible size changes */
function jitterSpeed(base: number): number {
  const factor = 0.05 + Math.random() * 3.95 // 0.05x to 4.0x
  return Math.round(base * factor)
}

/** Pick n random unique items from an array */
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

type Continent =
  | 'All'
  | 'North America'
  | 'South America'
  | 'Europe'
  | 'Africa'
  | 'Asia'
  | 'Oceania'

const CONTINENTS: Continent[] = [
  'All',
  'North America',
  'South America',
  'Europe',
  'Africa',
  'Asia',
  'Oceania'
]

/** Map country code to continent */
function getContinent(countryCode: string): Continent {
  const map: Record<string, Continent> = {
    US: 'North America',
    CA: 'North America',
    MX: 'North America',
    BR: 'South America',
    AR: 'South America',
    CL: 'South America',
    CO: 'South America',
    GB: 'Europe',
    FR: 'Europe',
    DE: 'Europe',
    SE: 'Europe',
    RU: 'Europe',
    IT: 'Europe',
    ES: 'Europe',
    NL: 'Europe',
    PL: 'Europe',
    NO: 'Europe',
    FI: 'Europe',
    JP: 'Asia',
    CN: 'Asia',
    IN: 'Asia',
    KR: 'Asia',
    SG: 'Asia',
    AU: 'Oceania',
    NZ: 'Oceania',
    KE: 'Africa',
    EG: 'Africa',
    ZA: 'Africa',
    NG: 'Africa'
  }
  return map[countryCode] || 'Asia'
}

const TICK_INTERVAL = 2000 // ms between simulation ticks

export default function MapPreview() {
  const navigate = useNavigate()
  const [simulating, setSimulating] = useState(true)
  const [continentFilter, setContinentFilter] = useState<Continent>('All')
  const filteredPool =
    continentFilter === 'All'
      ? PEER_POOL
      : PEER_POOL.filter(
          (p) => p.location && getContinent(p.location.countryCode) === continentFilter
        )
  const filteredPoolRef = useRef(filteredPool)
  filteredPoolRef.current = filteredPool

  const [peers, setPeers] = useState<PeerInfo[]>(() => pickRandom(PEER_POOL, 4))
  const peersRef = useRef(peers)
  peersRef.current = peers

  const tick = useCallback(() => {
    setPeers((prev) => {
      const pool = filteredPoolRef.current
      const poolIds = new Set(pool.map((p) => p.id))
      // Only keep peers that are still in the filtered pool
      let next = prev.filter((p) => poolIds.has(p.id))

      // 1. Jitter speeds for all current peers
      next = next.map((p) => ({
        ...p,
        downloadSpeed: jitterSpeed(
          pool.find((pp) => pp.id === p.id)?.downloadSpeed ?? p.downloadSpeed
        ),
        uploadSpeed: jitterSpeed(pool.find((pp) => pp.id === p.id)?.uploadSpeed ?? p.uploadSpeed),
        // Slowly accumulate downloaded/uploaded
        downloaded: p.downloaded + Math.round(p.downloadSpeed * (TICK_INTERVAL / 1000)),
        uploaded: p.uploaded + Math.round(p.uploadSpeed * (TICK_INTERVAL / 1000)),
        progress: Math.min(p.progress + Math.random() * 0.02, 1)
      }))

      // 2. Possibly remove a peer (30% chance, keep at least 2)
      if (next.length > 2 && Math.random() < 0.3) {
        const removeIdx = Math.floor(Math.random() * next.length)
        next.splice(removeIdx, 1)
      }

      // 3. Possibly add a peer (40% chance, cap at pool size)
      if (next.length < pool.length && Math.random() < 0.4) {
        const currentIds = new Set(next.map((p) => p.id))
        const available = pool.filter((p) => !currentIds.has(p.id))
        if (available.length > 0) {
          const newPeer = available[Math.floor(Math.random() * available.length)]
          next.push({
            ...newPeer,
            downloadSpeed: jitterSpeed(newPeer.downloadSpeed),
            uploadSpeed: jitterSpeed(newPeer.uploadSpeed),
            downloaded: 0,
            uploaded: 0,
            progress: 0
          })
        }
      }

      return next
    })
  }, [])

  useEffect(() => {
    if (!simulating) return
    const id = setInterval(tick, TICK_INTERVAL)
    return () => clearInterval(id)
  }, [simulating, tick])

  // Reset peers when continent filter changes
  useEffect(() => {
    const pool =
      continentFilter === 'All'
        ? PEER_POOL
        : PEER_POOL.filter(
            (p) => p.location && getContinent(p.location.countryCode) === continentFilter
          )
    setPeers(pickRandom(pool, Math.min(4, pool.length)))
  }, [continentFilter])

  const maxBandwidth = Math.max(1, ...peers.map((p) => p.downloadSpeed + p.uploadSpeed))
  const totalDown = peers.reduce((s, p) => s + p.downloadSpeed, 0)
  const totalUp = peers.reduce((s, p) => s + p.uploadSpeed, 0)

  const formatSpeed = (bps: number) => {
    if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} MB/s`
    return `${(bps / 1_000).toFixed(0)} KB/s`
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a12]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-zinc-800/50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="h-4 w-px bg-zinc-800" />
        <h1 className="text-sm font-medium text-white">Globe Preview</h1>

        {/* Stats */}
        <div className="ml-4 flex items-center gap-4 text-[10px] uppercase tracking-wider">
          <span className="text-zinc-500">
            Peers: <span className="text-emerald-400 font-mono">{peers.length}</span>
          </span>
          <span className="text-zinc-500">
            ↓ <span className="text-sky-400 font-mono">{formatSpeed(totalDown)}</span>
          </span>
          <span className="text-zinc-500">
            ↑ <span className="text-amber-400 font-mono">{formatSpeed(totalUp)}</span>
          </span>
        </div>

        {/* Controls */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setSimulating((v) => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/40 text-zinc-400 hover:text-white transition-colors"
          >
            {simulating ? <Pause size={12} /> : <Play size={12} />}
            {simulating ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={() => {
              setContinentFilter('All')
              setPeers(pickRandom(PEER_POOL, 4))
            }}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/40"
            title="Reset simulation"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Globe */}
      <div className="flex-1 min-h-0 p-4">
        <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-800/30">
          <PeerMap peers={peers} maxBandwidth={maxBandwidth} />
        </div>
      </div>

      {/* Continent filter */}
      <div className="px-6 pb-2 flex items-center gap-2 flex-wrap">
        {CONTINENTS.map((c) => (
          <button
            key={c}
            onClick={() => setContinentFilter(c)}
            className={`px-3 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-colors border ${
              continentFilter === c
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                : 'bg-zinc-900/60 border-zinc-800/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Peer info strip */}
      <div className="px-6 pb-4 flex items-center gap-3 flex-wrap">
        {peers.map((peer) => (
          <div
            key={peer.id}
            className="bg-zinc-900/60 border border-zinc-800/40 rounded-lg px-3 py-1.5 text-[10px] whitespace-nowrap"
          >
            <span className="text-zinc-400 font-medium">{peer.location?.city}</span>
            <span className="text-zinc-600 ml-1.5">{peer.location?.country}</span>
            <span className="text-sky-400/60 ml-2">↓{formatSpeed(peer.downloadSpeed)}</span>
            <span className="text-amber-400/60 ml-1">↑{formatSpeed(peer.uploadSpeed)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
