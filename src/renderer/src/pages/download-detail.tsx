import { useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Globe, Pause, Users, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { useDownloadsStore } from '../stores/downloads'
import { formatSpeed } from '../utils/formatters'
import { usePeers } from '../hooks/use-peers'
import PeerMap from '../components/peer-map'
import SpeedChart from '../components/speed-chart'
import { PeerList } from '../components/peer-card'
import { DownloadProgressRing } from '../components/download-progress-ring'
import { CountryStats } from '../components/country-stats'

export default function DownloadDetail() {
  const { downloadId } = useParams<{ downloadId: string }>()
  const navigate = useNavigate()
  const download = useDownloadsStore((s) => s.downloads.find((d) => d.id === downloadId))
  const pauseDownload = useDownloadsStore((s) => s.pause)
  const resumeDownload = useDownloadsStore((s) => s.resume)

  const { peers, stats, selectedPeer, togglePeer, topCountries, loading } = usePeers(downloadId)
  const { totalDownSpeed, totalUpSpeed, maxBandwidth, locatedCount } = stats

  const handleTogglePause = useCallback(() => {
    if (!download) return
    if (download.status === 'paused') {
      resumeDownload(download.id)
    } else {
      pauseDownload(download.id)
    }
  }, [download, pauseDownload, resumeDownload])

  const handleBack = useCallback(() => navigate('/downloads'), [navigate])

  if (!download) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">
        <div className="text-center">
          <p>Download not found</p>
          <button onClick={handleBack} className="text-sm text-blue-400 hover:text-blue-300 mt-2">
            Back to Downloads
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#111316]">
      {/* Main content: sidebar + map */}
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar — Peer list (1/3) */}
        <div className="w-1/3 border-r border-zinc-800/50 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-3 pt-5 pb-4 gap-1 relative z-[60] [-webkit-app-region:no-drag]">
            <button
              onClick={handleBack}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
            <h1 className="text-sm font-semibold text-white truncate ml-3">{download.name}</h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-zinc-800/30">
            {download.status === 'downloading' && (
              <button
                onClick={handleTogglePause}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white transition-colors"
              >
                <Pause size={12} />
                Pause
              </button>
            )}
          </div>

          {/* Speed chart */}
          <div className="h-32 border-b border-zinc-800/30 px-2 pt-2">
            <SpeedChart downloadSpeed={totalDownSpeed} uploadSpeed={totalUpSpeed} />
          </div>

          {/* Stats section: progress ring + speeds */}
          <div className="flex items-stretch gap-6 px-5 pb-3 py-5 border-b border-zinc-800/30">
            <DownloadProgressRing
              downloaded={download.downloaded}
              totalSize={download.totalSize}
              progress={download.progress || 0}
            />

            {/* Stacked stats with icons */}
            <div className="flex-1 flex flex-col gap-2 justify-center">
              <div className="flex items-center justify-between bg-zinc-900/60 rounded-xl px-3 py-2 border border-zinc-800/40">
                <Users size={14} className="text-zinc-400 shrink-0" />
                <p className="text-base font-bold text-white">{peers.length}</p>
              </div>
              <div className="flex items-center justify-between bg-zinc-900/60 rounded-xl px-3 py-2 border border-zinc-800/40">
                <ArrowUpFromLine size={14} className="text-blue-400 shrink-0" />
                <p className="text-base font-bold text-blue-400">{formatSpeed(totalUpSpeed)}</p>
              </div>
              <div className="flex items-center justify-between bg-zinc-900/60 rounded-xl px-3 py-2 border border-zinc-800/40">
                <ArrowDownToLine size={14} className="text-green-400 shrink-0" />
                <p className="text-base font-bold text-green-400">{formatSpeed(totalDownSpeed)}</p>
              </div>
            </div>
          </div>

          {/* Peer cards */}
          {loading ? (
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-zinc-900/70 rounded-2xl p-4 border border-zinc-800/40 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 bg-zinc-800 rounded" />
                      <div className="h-2.5 w-20 bg-zinc-800/60 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-5">
                    <div className="h-4 w-14 bg-zinc-800 rounded-full" />
                    <div className="h-3 w-16 bg-zinc-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PeerList peers={peers} selectedPeer={selectedPeer} onTogglePeer={togglePeer} />
          )}

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-zinc-800/50 text-[10px] text-zinc-600 flex items-center gap-1.5">
            <Globe size={10} />
            {loading ? (
              <span className="h-2.5 w-28 bg-zinc-800 rounded animate-pulse inline-block" />
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
            <div className="h-full rounded-2xl overflow-hidden border border-zinc-800/30 relative">
              <PeerMap peers={peers} maxBandwidth={maxBandwidth} />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#111316]/60 backdrop-blur-sm z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-400 rounded-full animate-spin" />
                    <p className="text-xs text-zinc-500">Locating peers…</p>
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
                    className="bg-zinc-900/60 border border-zinc-800/40 rounded-lg px-3 py-1.5 animate-pulse"
                  >
                    <div className="h-3 w-16 bg-zinc-800 rounded" />
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
