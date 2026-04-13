import { Play } from 'lucide-react'
import { usePlayerContext } from './player-context'

export default function PlayerCenterOverlay() {
  const { playback } = usePlayerContext()

  if (playback.playing || playback.buffering) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
      <button
        onClick={(e) => {
          e.stopPropagation()
          playback.togglePlay()
        }}
        aria-label="Play"
        className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center transition-colors"
      >
        <Play size={36} className="ml-1" />
      </button>
    </div>
  )
}
