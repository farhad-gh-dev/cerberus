import { PLAYBACK_RATES } from '../../utils/constants'
import { usePlayerContext } from './player-context'

export default function SpeedMenu() {
  const { speed } = usePlayerContext()

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          speed.toggleSpeedMenu()
        }}
        className="h-10 px-3 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-xs font-medium"
      >
        {speed.playbackRate}x
      </button>
      {speed.showSpeedMenu && (
        <div
          className="absolute bottom-full right-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-xl py-1 shadow-xl min-w-[100px]"
          onClick={(e) => e.stopPropagation()}
        >
          {PLAYBACK_RATES.map((rate) => (
            <button
              key={rate}
              onClick={() => speed.changePlaybackRate(rate)}
              className={`w-full text-left px-4 py-1.5 text-sm hover:bg-white/10 transition-colors ${
                rate === speed.playbackRate ? 'text-blue-400' : 'text-white/70'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
