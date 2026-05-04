import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmRemoveModalProps {
  movieTitle: string
  filePath?: string
  onConfirm: (deleteSource: boolean) => void
  onCancel: () => void
}

export default function ConfirmRemoveModal({
  movieTitle,
  filePath,
  onConfirm,
  onCancel
}: ConfirmRemoveModalProps) {
  const [deleteSource, setDeleteSource] = useState(false)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
      onClick={onCancel}
    >
      <div
        className="bg-custom-100 dark:bg-custom-900 dark:ring-2 dark:ring-white/8 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/15 dark:bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-custom-800 dark:text-custom-50">
              Remove Movie
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-custom-500 hover:text-custom-800 hover:bg-custom-200 dark:text-custom-400 dark:hover:text-custom-50 dark:hover:bg-custom-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-custom-600 dark:text-custom-300 mb-5">
          Are you sure you want to remove{' '}
          <span className="text-custom-800 dark:text-custom-50 font-medium">{movieTitle}</span> from
          your library?
        </p>

        {filePath && (
          <label className="flex items-center gap-3 p-3 rounded-xl bg-custom-200/60 hover:bg-custom-200 dark:bg-white/5 dark:hover:bg-white/10 cursor-pointer transition-colors mb-6">
            <input
              type="checkbox"
              checked={deleteSource}
              onChange={(e) => setDeleteSource(e.target.checked)}
              className="w-4 h-4 rounded border-custom-400 dark:border-white/30 bg-transparent text-red-500 focus:ring-red-500 focus:ring-offset-0 focus:ring-offset-transparent accent-red-500"
            />
            <div>
              <p className="text-sm text-custom-700 dark:text-custom-200">
                Also delete source files
              </p>
              <p className="text-xs text-custom-500 dark:text-custom-400 mt-0.5">
                This will permanently remove the downloaded video files from disk
              </p>
              {deleteSource && filePath && (
                <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-1.5 break-all">
                  {filePath}
                </p>
              )}
            </div>
          </label>
        )}

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-custom-700 hover:text-custom-800 bg-custom-200 hover:bg-custom-300 dark:text-white/70 dark:hover:text-white dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(deleteSource)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
