import { formatTime } from '../../utils/formatters'
import { usePlayerContext } from './player-context'

export default function SeekBar() {
  const { playback, seekBar } = usePlayerContext()

  const progressPct = playback.duration > 0 ? (playback.currentTime / playback.duration) * 100 : 0
  const bufferedPct = playback.duration > 0 ? (playback.buffered / playback.duration) * 100 : 0

  return (
    <div
      ref={seekBar.seekBarRef}
      className="group relative h-5 flex items-center cursor-pointer mb-1"
      onMouseDown={seekBar.onSeekMouseDown}
      onMouseMove={seekBar.onSeekHover}
      onMouseLeave={seekBar.clearHoverTime}
    >
      {/* Track */}
      <div className="absolute left-0 right-0 h-1 group-hover:h-1.5 bg-white/20 rounded-full transition-all">
        {/* Buffered */}
        <div
          className="absolute inset-y-0 left-0 bg-white/20 rounded-full"
          style={{ width: `${bufferedPct}%` }}
        />
        {/* Progress */}
        <div
          className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-blue-400 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ left: `calc(${progressPct}% - 7px)` }}
      />

      {/* Hover time tooltip */}
      {seekBar.hoverTime !== null && (
        <div
          className="absolute -top-8 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded pointer-events-none"
          style={{ left: `${seekBar.hoverX}px` }}
        >
          {formatTime(seekBar.hoverTime)}
        </div>
      )}
    </div>
  )
}
