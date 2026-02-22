import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  AlertCircle,
  Maximize,
  Minimize,
  PictureInPicture2
} from 'lucide-react'
import { formatTime } from '../../utils/formatters'
import { usePlayerContext } from './player-context'
import SeekBar from './seek-bar'
import VolumeControl from './volume-control'
import SpeedMenu from './speed-menu'
import LoadingSpinner from '../loading-spinner'
import EmptyState from '../empty-state'

export default function PlayerContent({ title, backTo }: { title: string; backTo: string }) {
  const navigate = useNavigate()
  const { playback, controls } = usePlayerContext()

  if (playback.loading) {
    return <LoadingSpinner size={40} className="h-full bg-black" />
  }

  if (playback.error || !playback.videoSrc) {
    return (
      <EmptyState
        icon={<AlertCircle size={48} className="text-red-400" />}
        title={playback.error || 'Could not load video'}
        className="h-full bg-black text-zinc-400"
        action={
          <button
            onClick={() => navigate(backTo)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Go Back
          </button>
        }
      />
    )
  }

  return (
    <div
      ref={controls.containerRef}
      className="relative h-full bg-black flex items-center justify-center select-none overflow-hidden"
      onMouseMove={controls.resetControlsTimer}
      style={{ cursor: controls.showControls ? 'default' : 'none' }}
    >
      {/* Video element */}
      <video
        ref={playback.videoRef}
        src={playback.videoSrc}
        className="w-full h-full"
        onClick={(e) => {
          e.stopPropagation()
          playback.togglePlay()
          controls.resetControlsTimer()
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          controls.toggleFullscreen()
        }}
        onPlay={playback.handlePlay}
        onPause={playback.handlePause}
        onTimeUpdate={playback.handleTimeUpdate}
        onLoadedMetadata={playback.handleLoadedMetadata}
        onProgress={playback.handleProgress}
        onEnded={playback.handleEnded}
      />

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none ${
          controls.showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top bar */}
        <div className="bg-gradient-to-b from-black/80 to-transparent p-4 pt-10 flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => navigate(backTo)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-50"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-sm font-medium text-white truncate">{title}</h2>
        </div>

        {/* Center play button (when paused) */}
        {!playback.playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation()
                playback.togglePlay()
              }}
              className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center transition-colors"
            >
              <Play size={36} className="ml-1" />
            </button>
          </div>
        )}

        {/* Bottom controls */}
        <div className="bg-gradient-to-t from-black/80 to-transparent px-4 pb-5 pt-10 pointer-events-auto">
          <SeekBar />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Play/Pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  playback.togglePlay()
                }}
                className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                {playback.playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>

              {/* Skip back */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  playback.skip(-10)
                  controls.resetControlsTimer()
                }}
                className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Back 10s (J)"
              >
                <SkipBack size={18} />
              </button>

              {/* Skip forward */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  playback.skip(10)
                  controls.resetControlsTimer()
                }}
                className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Forward 10s (L)"
              >
                <SkipForward size={18} />
              </button>

              <VolumeControl />

              {/* Time */}
              <span className="text-xs text-white/70 ml-2 tabular-nums">
                {formatTime(playback.currentTime)} / {formatTime(playback.duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <SpeedMenu />

              {/* PiP */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  controls.togglePip()
                }}
                className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Picture in Picture"
              >
                <PictureInPicture2 size={18} />
              </button>

              {/* Fullscreen */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  controls.toggleFullscreen()
                }}
                className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Fullscreen (F)"
              >
                {controls.isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
