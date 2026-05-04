import { Volume2, Volume1, VolumeX } from 'lucide-react'
import { usePlayerContext } from './player-context'

export default function VolumeControl() {
  const { volume: vol } = usePlayerContext()

  const VolumeIcon = vol.muted || vol.volume === 0 ? VolumeX : vol.volume < 0.5 ? Volume1 : Volume2
  const displayVolume = (vol.muted ? 0 : vol.volume) * 100

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          vol.toggleMute()
        }}
        className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
      >
        <VolumeIcon size={20} />
      </button>

      <div
        ref={vol.volumeBarRef}
        className="group/vol relative w-20 h-8 flex items-center cursor-pointer"
        onMouseDown={vol.onVolumeMouseDown}
      >
        <div className="absolute left-0 right-0 h-1 bg-white/20 rounded-full">
          <div className="h-full bg-white rounded-full" style={{ width: `${displayVolume}%` }} />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/vol:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `calc(${displayVolume}% - 6px)` }}
        />
      </div>
    </>
  )
}
