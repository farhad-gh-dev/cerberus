import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  PictureInPicture2,
  Lock
} from 'lucide-react'
import { formatTime } from '../../utils/formatters'
import { usePlayerContext } from './player-context'
import SeekBar from './seek-bar'
import VolumeControl from './volume-control'
import SpeedMenu from './speed-menu'
import SubtitleMenu from './subtitle-menu'

const SKIP_SECONDS = 10

/** Wraps a handler so `stopPropagation` is called automatically. */
function stop(fn: () => void) {
  return (e: React.MouseEvent) => {
    e.stopPropagation()
    fn()
  }
}

export default function PlayerBottomControls() {
  const { playback, controls } = usePlayerContext()

  return (
    <div className="bg-gradient-to-t from-black/80 to-transparent px-4 pb-5 pt-10 pointer-events-auto">
      <SeekBar />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Play / Pause */}
          <button
            onClick={stop(playback.togglePlay)}
            aria-label={playback.playing ? 'Pause' : 'Play'}
            className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            {playback.playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
          </button>

          {/* Skip back */}
          <button
            onClick={stop(() => {
              playback.skip(-SKIP_SECONDS)
              controls.resetControlsTimer()
            })}
            aria-label={`Back ${SKIP_SECONDS}s`}
            title={`Back ${SKIP_SECONDS}s (J)`}
            className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <SkipBack size={18} />
          </button>

          {/* Skip forward */}
          <button
            onClick={stop(() => {
              playback.skip(SKIP_SECONDS)
              controls.resetControlsTimer()
            })}
            aria-label={`Forward ${SKIP_SECONDS}s`}
            title={`Forward ${SKIP_SECONDS}s (L)`}
            className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <SkipForward size={18} />
          </button>

          <VolumeControl />

          {/* Time display */}
          <span className="text-xs text-white/70 ml-2 tabular-nums">
            {formatTime(playback.currentTime)} / {formatTime(playback.duration)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <SpeedMenu />
          <SubtitleMenu />

          {/* Lock */}
          <button
            onClick={stop(() => {
              controls.toggleLock()
              controls.resetControlsTimer()
            })}
            aria-label="Lock controls"
            title="Lock controls"
            className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Lock size={18} />
          </button>

          {/* Picture-in-Picture */}
          <button
            onClick={stop(controls.togglePip)}
            aria-label="Picture in Picture"
            title="Picture in Picture"
            className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <PictureInPicture2 size={18} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={stop(controls.toggleFullscreen)}
            aria-label={controls.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title="Fullscreen (F)"
            className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            {controls.isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}
