import { useRef, useEffect } from 'react'
import { Subtitles, ChevronUp, ChevronDown, Minus, Plus, Globe } from 'lucide-react'
import { usePlayerContext } from './player-context'
import { useSettingsStore } from '../../stores/settings'
import { SUBTITLE_POSITIONS, SUBTITLE_FONT_SIZES } from './subtitle-utils'

export default function SubtitleMenu() {
  const { subtitles } = usePlayerContext()
  const { settings, load: loadSettings } = useSettingsStore()
  const hasSubtitleKey =
    settings?.subtitleProvider === 'subdl'
      ? !!settings?.subdlApiKey
      : !!settings?.openSubtitlesApiKey
  const menuRef = useRef<HTMLDivElement>(null)

  // Ensure settings are loaded so we can check for the API key
  useEffect(() => {
    if (!settings) loadSettings()
  }, [settings, loadSettings])

  // Close menu when clicking outside
  useEffect(() => {
    if (!subtitles.showMenu) return

    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        subtitles.toggleMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [subtitles.showMenu, subtitles.toggleMenu])

  const hasTracksOrOnline = subtitles.tracks.length > 0 || subtitles.hasImdbId
  if (!hasTracksOrOnline) return null

  const currentPosLabel =
    SUBTITLE_POSITIONS.find((p) => p.value === subtitles.bottomOffset)?.label || ''
  const currentSizeLabel =
    SUBTITLE_FONT_SIZES.find((s) => s.value === subtitles.fontSize)?.label || ''

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          subtitles.toggleMenu()
        }}
        className={`w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors ${
          subtitles.activeIndex !== null ? 'text-blue-400' : ''
        }`}
        title="Subtitles (C)"
      >
        <Subtitles size={18} />
      </button>
      {subtitles.showMenu && (
        <div
          className="absolute bottom-full right-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-xl py-1 shadow-xl min-w-[160px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Track selection */}
          <button
            onClick={() => subtitles.disableSubtitles()}
            className={`w-full text-left px-4 py-1.5 text-sm hover:bg-white/10 transition-colors ${
              subtitles.activeIndex === null ? 'text-blue-400' : 'text-white/70'
            }`}
          >
            Off
          </button>
          {subtitles.tracks.map((track, index) => (
            <button
              key={track.filePath}
              onClick={() => subtitles.selectTrack(index)}
              className={`w-full text-left px-4 py-1.5 text-sm hover:bg-white/10 transition-colors ${
                index === subtitles.activeIndex ? 'text-blue-400' : 'text-white/70'
              }`}
            >
              {track.label}
              {track.format !== 'vtt' && (
                <span className="ml-1.5 text-[10px] text-white/40 uppercase">{track.format}</span>
              )}
            </button>
          ))}

          {/* Search online */}
          {subtitles.hasImdbId && (
            <>
              <div className="border-t border-zinc-700 my-1" />
              <button
                onClick={() => {
                  if (!hasSubtitleKey) return
                  subtitles.online.openOnlineSearch()
                  subtitles.online.searchOnline()
                }}
                disabled={!hasSubtitleKey}
                className={`w-full text-left px-4 py-1.5 text-sm transition-colors flex items-center gap-2 ${
                  hasSubtitleKey
                    ? 'hover:bg-white/10 text-white/70'
                    : 'text-white/30 cursor-not-allowed'
                }`}
                title={
                  hasSubtitleKey
                    ? 'Search for subtitles online'
                    : `Add an API key for ${settings?.subtitleProvider === 'subdl' ? 'Subdl' : 'OpenSubtitles'} in Settings to enable online search`
                }
              >
                <Globe size={14} />
                Search Online
              </button>
            </>
          )}

          {/* Position controls */}
          {subtitles.activeIndex !== null && (
            <>
              <div className="border-t border-zinc-700 my-1" />
              <div className="px-4 py-1.5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-white/50">Position</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => subtitles.moveDown()}
                    className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors text-white/70"
                    title="Move subtitles down"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <span className="text-[11px] text-white/50 min-w-[46px] text-center">
                    {currentPosLabel}
                  </span>
                  <button
                    onClick={() => subtitles.moveUp()}
                    className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors text-white/70"
                    title="Move subtitles up"
                  >
                    <ChevronUp size={14} />
                  </button>
                </div>
              </div>
              <div className="px-4 py-1.5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-white/50">Size</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => subtitles.decreaseFontSize()}
                    className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors text-white/70"
                    title="Decrease font size"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-[11px] text-white/50 min-w-[46px] text-center">
                    {currentSizeLabel}
                  </span>
                  <button
                    onClick={() => subtitles.increaseFontSize()}
                    className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors text-white/70"
                    title="Increase font size"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
