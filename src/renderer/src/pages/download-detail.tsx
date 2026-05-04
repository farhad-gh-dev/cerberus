import { useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Globe, Users, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { useDownloadById } from '../stores/downloads'
import { formatSpeed } from '../utils/formatters'
import { usePeers } from '../hooks/use-peers'
import PeerMap from '../components/peer/peer-map'
import SpeedChart from '../components/speed-chart'
import { PeerList } from '../components/peer/peer-card'
import { DownloadProgressRing } from '../components/download/download-progress-ring'
import { CountryStats } from '../components/peer/country-stats'

export default function DownloadDetail() {
  const { downloadId } = useParams<{ downloadId: string }>()
  const navigate = useNavigate()
  const download = useDownloadById(downloadId)

  const { peers, stats, selectedPeer, togglePeer, topCountries, loading } = usePeers(downloadId)
  const { totalDownSpeed, totalUpSpeed, maxBandwidth, locatedCount } = stats

  const handleBack = useCallback(() => navigate('/downloads'), [navigate])

  if (!download) {
    return (
      <div className="h-full flex items-center justify-center text-custom-500 dark:text-custom-400">
        <div className="text-center">
          <p>Download not found</p>
          <button
            onClick={handleBack}
            className="text-sm text-custom-700 hover:text-custom-900 dark:text-custom-200 dark:hover:text-custom-50 mt-2"
          >
            Back to Downloads
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-custom-100 dark:bg-custom-900">
      {/* Main content: sidebar + map */}
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar — Peer list (1/3) */}
        <div className="w-1/3 border-r border-custom-200 dark:border-custom-700/60 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-3 pt-5 pb-4 gap-1 relative z-[60] [-webkit-app-region:no-drag]">
            <button
              onClick={handleBack}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-custom-50 text-custom-500 hover:text-custom-800 transition-colors dark:bg-transparent dark:text-custom-400 dark:hover:bg-custom-700 dark:hover:text-custom-50"
            >
              <X size={14} />
            </button>
            <h1 className="text-sm font-semibold text-custom-800 dark:text-custom-50 truncate ml-3">
              {download.name}
            </h1>
          </div>

          {/* Speed chart */}
          <div className="h-32 border-b border-custom-200 dark:border-custom-700/60 px-2 pt-2">
            <SpeedChart downloadSpeed={totalDownSpeed} uploadSpeed={totalUpSpeed} />
          </div>

          {/* Stats section: progress ring + speeds */}
          <div className="flex items-stretch gap-6 px-5 pb-3 py-5 border-b border-custom-200 dark:border-custom-700/60">
            <DownloadProgressRing
              downloaded={download.downloaded}
              totalSize={download.totalSize}
              progress={download.progress || 0}
            />

            {/* Stacked stats with icons */}
            <div className="flex-1 flex flex-col gap-2 justify-center">
              <div className="flex items-center justify-between rounded-xl border border-custom-200 bg-custom-50/60 px-3 py-2 dark:border-custom-700/60 dark:bg-custom-800/60">
                <Users size={14} className="text-custom-500 dark:text-custom-400 shrink-0" />
                <p className="text-base font-bold text-custom-800 dark:text-custom-50">
                  {peers.length}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-custom-200 bg-custom-50/60 px-3 py-2 dark:border-custom-700/60 dark:bg-custom-800/60">
                <ArrowUpFromLine size={14} className="text-blue-400 shrink-0" />
                <p className="text-base font-bold text-blue-400">{formatSpeed(totalUpSpeed)}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-custom-200 bg-custom-50/60 px-3 py-2 dark:border-custom-700/60 dark:bg-custom-800/60">
                <ArrowDownToLine
                  size={14}
                  className="text-green-500 dark:text-green-400 shrink-0"
                />
                <p className="text-base font-bold text-green-500 dark:text-green-400">
                  {formatSpeed(totalDownSpeed)}
                </p>
              </div>
            </div>
          </div>

          {/* Peer cards */}
          {loading ? (
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-custom-200 bg-custom-50/60 p-4 animate-pulse dark:border-custom-700/60 dark:bg-custom-800/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-custom-200 dark:bg-custom-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 bg-custom-200 dark:bg-custom-700 rounded" />
                      <div className="h-2.5 w-20 bg-custom-200/60 dark:bg-custom-700/60 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-5">
                    <div className="h-4 w-14 bg-custom-200 dark:bg-custom-700 rounded-full" />
                    <div className="h-3 w-16 bg-custom-200 dark:bg-custom-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PeerList peers={peers} selectedPeer={selectedPeer} onTogglePeer={togglePeer} />
          )}

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-custom-200 dark:border-custom-700/60 text-[10px] text-custom-500 dark:text-custom-500 flex items-center gap-1.5">
            <Globe size={10} />
            {loading ? (
              <span className="h-2.5 w-28 bg-custom-200 dark:bg-custom-700 rounded animate-pulse inline-block" />
            ) : (
              <>
                {locatedCount} of {peers.length} peers geolocated
              </>
            )}
          </div>
        </div>

        {/* Right panel — Map (2/3) */}
        <div className="w-2/3 flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <div className="h-full rounded-2xl overflow-hidden relative">
              <PeerMap peers={peers} maxBandwidth={maxBandwidth} />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-custom-100/70 dark:bg-custom-900/70 backdrop-blur-sm z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-custom-200 border-t-custom-800 dark:border-custom-700 dark:border-t-custom-50 rounded-full animate-spin" />
                    <p className="text-xs text-custom-500 dark:text-custom-400">Locating peers…</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom stats row */}
          <div className="flex items-center gap-4 p-2">
            {loading ? (
              <div className="flex items-center gap-3 flex-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-custom-200 bg-custom-50/60 px-3 py-1.5 animate-pulse dark:border-custom-700/60 dark:bg-custom-800/60"
                  >
                    <div className="h-3 w-16 bg-custom-200 dark:bg-custom-700 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <CountryStats countries={topCountries} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
