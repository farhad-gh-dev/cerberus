import { memo, useMemo } from 'react'
import { Globe, MoreHorizontal } from 'lucide-react'
import type { PeerInfo } from '@shared/types'
import { formatBytes, formatSpeed } from '../../utils/formatters'

const FLAG_CDN_BASE = 'https://flagcdn.com/w80'

function flagUrl(code: string): string {
  return `${FLAG_CDN_BASE}/${code.toLowerCase()}.png`
}

interface PeerCardProps {
  peer: PeerInfo
  isExpanded: boolean
  onToggle: (address: string) => void
}

export const PeerCard = memo(function PeerCard({ peer, isExpanded, onToggle }: PeerCardProps) {
  const isActive = peer.downloadSpeed > 0 || peer.uploadSpeed > 0

  return (
    <div className="rounded-2xl border border-custom-200 bg-custom-50/60 p-4 transition-colors hover:border-custom-300 dark:border-custom-700/60 dark:bg-custom-800/60 dark:hover:border-custom-700">
      {/* Top row: flag + address + dots */}
      <div className="flex items-center gap-3">
        {/* Country flag avatar */}
        <div className="w-10 h-10 rounded-full bg-custom-200 dark:bg-custom-800 flex items-center justify-center shrink-0 border border-custom-300/60 dark:border-custom-700/50 overflow-hidden">
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

        {/* Name + location */}
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

        {/* More menu */}
        <button
          onClick={() => onToggle(peer.address)}
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
              ? 'bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-custom-200 text-custom-500 dark:bg-custom-800 dark:text-custom-400'
          }`}
        >
          {isActive ? 'Active' : 'Idle'}
        </span>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-custom-500 dark:text-custom-400">Down</p>
            <p className="text-sm font-semibold text-custom-800 dark:text-custom-50">
              {peer.downloadSpeed > 0 ? formatSpeed(peer.downloadSpeed) : '--'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-custom-500 dark:text-custom-400">Up</p>
            <p className="text-sm font-semibold text-custom-800 dark:text-custom-50">
              {peer.uploadSpeed > 0 ? formatSpeed(peer.uploadSpeed) : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-custom-200 dark:border-custom-700/50 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] overflow-hidden">
          <div className="min-w-0">
            <span className="text-custom-500 dark:text-custom-500">Port: </span>
            <span className="text-custom-700 dark:text-custom-300">{peer.port}</span>
          </div>
          <div className="min-w-0">
            <span className="text-custom-500 dark:text-custom-500">Client: </span>
            <span className="text-custom-700 dark:text-custom-300 break-all">{peer.client}</span>
          </div>
          <div className="min-w-0">
            <span className="text-custom-500 dark:text-custom-500">Downloaded: </span>
            <span className="text-custom-700 dark:text-custom-300">
              {formatBytes(peer.downloaded)}
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-custom-500 dark:text-custom-500">Uploaded: </span>
            <span className="text-custom-700 dark:text-custom-300">
              {formatBytes(peer.uploaded)}
            </span>
          </div>
          {peer.location && (
            <>
              <div className="min-w-0">
                <span className="text-custom-500 dark:text-custom-500">ISP: </span>
                <span className="text-custom-700 dark:text-custom-300 break-all">
                  {peer.location.isp}
                </span>
              </div>
              <div className="min-w-0">
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
})

interface PeerListProps {
  peers: PeerInfo[]
  selectedPeer: string | null
  onTogglePeer: (address: string) => void
}

export const PeerList = memo(function PeerList({
  peers,
  selectedPeer,
  onTogglePeer
}: PeerListProps) {
  // Hide idle handshake-only peers; sort the rest by total bandwidth.
  const sortedPeers = useMemo(
    () =>
      peers
        .filter((p) => p.downloadSpeed > 0 || p.uploadSpeed > 0)
        .sort((a, b) => b.downloadSpeed + b.uploadSpeed - (a.downloadSpeed + a.uploadSpeed)),
    [peers]
  )

  if (sortedPeers.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col items-center justify-center h-full text-custom-500 dark:text-custom-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-2"
          >
            <line x1="1" x2="23" y1="1" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" x2="12.01" y1="20" y2="20" />
          </svg>
          <p className="text-xs">No peers connected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-1 py-3 space-y-3">
      {sortedPeers.map((peer) => (
        <PeerCard
          key={peer.id}
          peer={peer}
          isExpanded={selectedPeer === peer.address}
          onToggle={onTogglePeer}
        />
      ))}
    </div>
  )
})
