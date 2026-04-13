import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { usePlayerContext } from './player-context'
import PlayerTopBar from './player-top-bar'
import PlayerCenterOverlay from './player-center-overlay'
import PlayerBottomControls from './player-bottom-controls'
import SubtitleOverlay from './subtitle-overlay'
import OnlineSubtitlePanel from './online-subtitle-panel'
import StreamingStatsOverlay from './streaming-stats-overlay'
import LoadingSpinner from '../loading-spinner'
import EmptyState from '../empty-state'

export default function PlayerContent({ title, backTo }: { title: string; backTo: string }) {
  const navigate = useNavigate()
  const { playback, controls, subtitles } = usePlayerContext()

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
      <video
        ref={playback.videoRef}
        src={playback.videoSrc}
        crossOrigin="anonymous"
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
        onWaiting={playback.handleWaiting}
        onCanPlay={playback.handleCanPlay}
      >
        {subtitles.subtitleUrls.map((url, i) => (
          <track
            key={url}
            kind="subtitles"
            src={url}
            label={subtitles.tracks[i]?.label || `Track ${i + 1}`}
            srcLang={subtitles.tracks[i]?.language || 'en'}
          />
        ))}
      </video>

      <SubtitleOverlay />
      <OnlineSubtitlePanel />
      <StreamingStatsOverlay />

      {/* Buffering spinner */}
      {playback.buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <LoadingSpinner size={48} className="" />
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none ${
          controls.showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <PlayerTopBar title={title} backTo={backTo} />
        <PlayerCenterOverlay />
        <PlayerBottomControls />
      </div>
    </div>
  )
}
