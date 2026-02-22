import { Download, Play, BookmarkPlus, BookmarkCheck } from 'lucide-react'

interface MovieActionsProps {
  hasFile: boolean
  inLibrary: boolean
  addingToLibrary: boolean
  playDisabled: boolean
  onPlay: () => void
  onFindTorrents: () => void
  onAddToLibrary: () => void
}

export default function MovieActions({
  hasFile,
  inLibrary,
  addingToLibrary,
  playDisabled,
  onPlay,
  onFindTorrents,
  onAddToLibrary
}: MovieActionsProps) {
  return (
    <>
      {hasFile ? (
        <button
          onClick={onPlay}
          disabled={playDisabled}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-7 py-3 rounded-xl transition-colors"
        >
          <Play size={18} />
          Play
        </button>
      ) : (
        <button
          onClick={onFindTorrents}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-7 py-3 rounded-xl transition-colors"
        >
          <Download size={18} />
          Find Torrents
        </button>
      )}
      {inLibrary ? (
        <button
          disabled
          className="flex items-center gap-2 bg-green-500/20 text-green-400 font-semibold px-7 py-3 rounded-xl cursor-default"
        >
          <BookmarkCheck size={18} />
          In Library
        </button>
      ) : (
        <button
          onClick={onAddToLibrary}
          disabled={addingToLibrary}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-7 py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          <BookmarkPlus size={18} />
          {addingToLibrary ? 'Adding...' : 'Add to Library'}
        </button>
      )}
    </>
  )
}
