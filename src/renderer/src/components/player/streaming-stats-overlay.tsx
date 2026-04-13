import { Radio, ArrowDown, ArrowUp, Users } from 'lucide-react'
import { formatSpeed } from '../../utils/formatters'
import { usePlayerContext } from './player-context'

export default function StreamingStatsOverlay() {
  const { streamingStats, controls } = usePlayerContext()

  if (!streamingStats || !controls.showControls) return null

  return (
    <div className="absolute top-10 right-4 pointer-events-none z-20 flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white/80 tabular-nums">
      <Radio size={14} className="text-emerald-400 animate-pulse" />

      <span className="flex items-center gap-1" title="Download speed">
        <ArrowDown size={12} className="text-emerald-400" />
        {formatSpeed(streamingStats.downloadSpeed)}
      </span>

      <span className="flex items-center gap-1" title="Upload speed">
        <ArrowUp size={12} className="text-blue-400" />
        {formatSpeed(streamingStats.uploadSpeed)}
      </span>

      <span className="flex items-center gap-1" title="Connected peers">
        <Users size={12} className="text-amber-400" />
        {streamingStats.numPeers}
      </span>

      <span className="text-white/50" title="Torrent download progress">
        {(streamingStats.progress * 100).toFixed(1)}%
      </span>
    </div>
  )
}
