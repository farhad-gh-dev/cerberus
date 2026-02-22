import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmRemoveModalProps {
  movieTitle: string
  filePath?: string
  onConfirm: (deleteSource: boolean, removeFromLibrary: boolean) => void
  onCancel: () => void
}

export default function ConfirmRemoveModal({
  movieTitle,
  filePath,
  onConfirm,
  onCancel
}: ConfirmRemoveModalProps) {
  const [deleteSource, setDeleteSource] = useState(false)
  const [removeFromLibrary, setRemoveFromLibrary] = useState(true)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
      onClick={onCancel}
    >
      <div
        className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Remove Movie</h2>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-white/60 mb-5">
          Are you sure you want to remove{' '}
          <span className="text-white font-medium">{movieTitle}</span> from your library?
        </p>

        {filePath && (
          <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors mb-6">
            <input
              type="checkbox"
              checked={deleteSource}
              onChange={(e) => setDeleteSource(e.target.checked)}
              className="w-4 h-4 rounded border-white/30 bg-transparent text-red-500 focus:ring-red-500 focus:ring-offset-0 focus:ring-offset-transparent accent-red-500"
            />
            <div>
              <p className="text-sm text-white/80">Also delete source files</p>
              <p className="text-xs text-white/40 mt-0.5">
                This will permanently remove the downloaded video files from disk
              </p>
              {deleteSource && filePath && (
                <p className="text-xs text-red-400/70 mt-1.5 break-all">{filePath}</p>
              )}
            </div>
          </label>
        )}

        <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors mb-6">
          <input
            type="checkbox"
            checked={removeFromLibrary}
            onChange={(e) => setRemoveFromLibrary(e.target.checked)}
            className="w-4 h-4 rounded border-white/30 bg-transparent text-red-500 focus:ring-red-500 focus:ring-offset-0 focus:ring-offset-transparent accent-red-500"
          />
          <div>
            <p className="text-sm text-white/80">Remove from library</p>
            <p className="text-xs text-white/40 mt-0.5">
              {removeFromLibrary
                ? 'The movie will be completely removed from your library'
                : 'The movie will stay in your library without a linked video'}
            </p>
          </div>
        </label>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(deleteSource, removeFromLibrary)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
