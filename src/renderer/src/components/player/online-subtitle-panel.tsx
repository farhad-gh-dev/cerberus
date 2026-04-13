import { useRef, useEffect } from 'react'
import { X, Download, Loader2, Globe, Check, AlertCircle } from 'lucide-react'
import { usePlayerContext } from './player-context'
import { LANGUAGES } from './languages'

export default function OnlineSubtitlePanel() {
  const { subtitles } = usePlayerContext()
  const { online } = subtitles
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!online.showOnlineSearch) return

    const handleClickOutside = (e: MouseEvent): void => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        online.closeOnlineSearch()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [online.showOnlineSearch, online.closeOnlineSearch])

  if (!online.showOnlineSearch) return null

  return (
    <div
      ref={panelRef}
      className="absolute right-4 top-16 bottom-20 w-80 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl shadow-2xl flex flex-col z-50 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <div className="flex items-center gap-2 text-white text-sm font-medium">
          <Globe size={16} />
          Search Subtitles
        </div>
        <button
          onClick={online.closeOnlineSearch}
          className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Language selector */}
      <div className="px-4 py-2.5 border-b border-zinc-800">
        <select
          value={online.onlineLanguage}
          onChange={(e) => online.changeOnlineLanguage(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-1.5 text-sm text-white/90 focus:outline-none focus:border-blue-500 transition-colors"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {online.searchingOnline && (
          <div className="flex items-center justify-center py-12 text-white/50">
            <Loader2 size={20} className="animate-spin mr-2" />
            <span className="text-sm">Searching…</span>
          </div>
        )}

        {!online.searchingOnline && online.onlineError && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <AlertCircle size={20} className="text-red-400 mb-2" />
            <p className="text-sm text-red-400">{online.onlineError}</p>
          </div>
        )}

        {!online.searchingOnline && !online.onlineError && online.onlineResults.length === 0 && (
          <div className="flex items-center justify-center py-12 text-white/40 text-sm">
            No subtitles found
          </div>
        )}

        {!online.searchingOnline &&
          online.onlineResults.map((result) => {
            const isDownloaded = online.downloadedIds.has(result.id)
            return (
              <div
                key={result.id}
                className="px-4 py-2.5 border-b border-zinc-800 last:border-b-0 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate" title={result.fileName}>
                      {result.fileName}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-white/40">
                      <span>{result.language}</span>
                      {result.downloadCount > 0 && (
                        <span>{result.downloadCount.toLocaleString()} downloads</span>
                      )}
                      {result.rating > 0 && <span>★ {result.rating.toFixed(1)}</span>}
                    </div>
                  </div>
                  {isDownloaded ? (
                    <div
                      className="shrink-0 w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center text-green-400"
                      title="Downloaded"
                    >
                      <Check size={14} />
                    </div>
                  ) : (
                    <button
                      onClick={() => online.downloadAndActivate(result.id)}
                      disabled={online.downloadingId !== null}
                      className="shrink-0 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-white/30 flex items-center justify-center transition-colors text-white"
                      title="Download and use"
                    >
                      {online.downloadingId === result.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-700">
        <p className="text-[10px] text-white/30 text-center">
          Powered by online subtitle providers
        </p>
      </div>
    </div>
  )
}
