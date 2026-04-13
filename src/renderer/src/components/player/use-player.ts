import { useRef } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { useVideoPlayback } from './use-video-playback'
import { useVideoControls } from './use-video-controls'
import { useKeyboardShortcuts } from './use-keyboard-shortcuts'
import { useSeekBar } from './use-seek-bar'
import { useVolume } from './use-volume'
import { usePlaybackRate } from './use-playback-rate'
import { useSubtitles } from './use-subtitles'
import { useStreamingStats } from './use-streaming-stats'

export function usePlayer(
  filePath: string | null,
  navigate: NavigateFunction,
  backTo: string,
  imdbId?: string,
  streamId?: string
) {
  const seekBarRef = useRef<HTMLDivElement>(null)

  const playback = useVideoPlayback(filePath, streamId)
  const streamingStats = useStreamingStats(streamId)
  const seekBar = useSeekBar(
    playback.videoRef,
    seekBarRef,
    playback.duration,
    playback.setCurrentTime,
    streamId
  )
  const vol = useVolume(playback.videoRef)
  const speed = usePlaybackRate(playback.videoRef)

  const subtitles = useSubtitles({
    videoRef: playback.videoRef,
    videoSrc: playback.videoSrc,
    imdbId
  })

  const controls = useVideoControls({
    videoRef: playback.videoRef,
    playing: playback.playing,
    isSeeking: seekBar.isSeeking,
    isDraggingVolume: vol.isDraggingVolume,
    showSpeedMenu: speed.showSpeedMenu,
    showSubtitleMenu: subtitles.showMenu
  })

  useKeyboardShortcuts({
    videoRef: playback.videoRef,
    togglePlay: playback.togglePlay,
    skip: playback.skip,
    toggleFullscreen: controls.toggleFullscreen,
    toggleMute: vol.toggleMute,
    adjustVolume: vol.adjustVolume,
    resetControlsTimer: controls.resetControlsTimer,
    navigate,
    backTo,
    isFullscreen: controls.isFullscreen,
    showSpeedMenu: speed.showSpeedMenu,
    setShowSpeedMenu: speed.setShowSpeedMenu,
    cycleSubtitleTrack: subtitles.cycleTrack
  })

  return {
    playback: {
      videoRef: playback.videoRef,
      videoSrc: playback.videoSrc,
      loading: playback.loading,
      error: playback.error,
      playing: playback.playing,
      buffering: playback.buffering,
      currentTime: playback.currentTime,
      duration: playback.duration,
      buffered: playback.buffered,
      togglePlay: playback.togglePlay,
      skip: playback.skip,
      handlePlay: playback.handlePlay,
      handlePause: playback.handlePause,
      handleTimeUpdate: playback.handleTimeUpdate,
      handleLoadedMetadata: playback.handleLoadedMetadata,
      handleProgress: playback.handleProgress,
      handleEnded: playback.handleEnded,
      handleWaiting: playback.handleWaiting,
      handleCanPlay: playback.handleCanPlay
    },
    controls: {
      containerRef: controls.containerRef,
      showControls: controls.showControls,
      isFullscreen: controls.isFullscreen,
      toggleFullscreen: controls.toggleFullscreen,
      togglePip: controls.togglePip,
      resetControlsTimer: controls.resetControlsTimer
    },
    seekBar: {
      seekBarRef,
      hoverTime: seekBar.hoverTime,
      hoverX: seekBar.hoverX,
      onSeekMouseDown: seekBar.onSeekMouseDown,
      onSeekHover: seekBar.onSeekHover,
      clearHoverTime: seekBar.clearHoverTime
    },
    volume: {
      volumeBarRef: vol.volumeBarRef,
      volume: vol.volume,
      muted: vol.muted,
      toggleMute: vol.toggleMute,
      onVolumeMouseDown: vol.onVolumeMouseDown
    },
    speed: {
      playbackRate: speed.playbackRate,
      showSpeedMenu: speed.showSpeedMenu,
      toggleSpeedMenu: speed.toggleSpeedMenu,
      changePlaybackRate: speed.changePlaybackRate
    },
    subtitles: {
      tracks: subtitles.tracks,
      activeIndex: subtitles.activeIndex,
      subtitleUrls: subtitles.subtitleUrls,
      showMenu: subtitles.showMenu,
      activeCueText: subtitles.activeCueText,
      bottomOffset: subtitles.bottomOffset,
      fontSize: subtitles.fontSize,
      hasImdbId: subtitles.hasImdbId,
      selectTrack: subtitles.selectTrack,
      disableSubtitles: subtitles.disableSubtitles,
      toggleMenu: subtitles.toggleMenu,
      cycleTrack: subtitles.cycleTrack,
      moveUp: subtitles.moveUp,
      moveDown: subtitles.moveDown,
      increaseFontSize: subtitles.increaseFontSize,
      decreaseFontSize: subtitles.decreaseFontSize,
      online: subtitles.online
    },
    streamingStats,
    streamId
  }
}
