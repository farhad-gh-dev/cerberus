import { Play, FolderOpen, Download, Trash2, Radio } from 'lucide-react'

interface LibraryActionsProps {
  hasFile: boolean
  playDisabled: boolean
  onPlay: () => void
  onOpenFolder: () => void
  onFindTorrents: () => void
  onRemove: () => void
  onStream?: () => void
}

export default function LibraryActions({
  hasFile,
  playDisabled,
  onPlay,
  onOpenFolder,
  onFindTorrents,
  onRemove,
  onStream
}: LibraryActionsProps) {
  return (
    <>
      {hasFile && (
        <button
          onClick={onPlay}
          disabled={playDisabled}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-7 py-3 rounded-xl transition-colors"
        >
          <Play size={18} />
          Play
        </button>
      )}
      {hasFile && (
        <button
          onClick={onOpenFolder}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-7 py-3 rounded-xl transition-colors"
        >
          <FolderOpen size={18} />
          Open Folder
        </button>
      )}
      {!hasFile && onStream && (
        <button
          onClick={onStream}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-7 py-3 rounded-xl transition-colors"
        >
          <Radio size={18} />
          Stream
        </button>
      )}
      {!hasFile && (
        <button
          onClick={onFindTorrents}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-7 py-3 rounded-xl transition-colors"
        >
          <Download size={18} />
          Find Torrents
        </button>
      )}
      <button
        onClick={onRemove}
        className="flex items-center gap-2 bg-white/10 hover:bg-red-500/20 backdrop-blur-sm text-white/70 hover:text-red-400 font-semibold px-7 py-3 rounded-xl transition-colors"
      >
        <Trash2 size={18} />
        Remove
      </button>
    </>
  )
}
