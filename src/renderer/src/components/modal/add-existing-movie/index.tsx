import { useEffect, useMemo } from 'react'
import { Plus, X } from 'lucide-react'
import type { LibraryMovie } from '@shared/types'
import { useBatchImport } from '../../../hooks/use-batch-import'
import DropZone from './drop-zone'
import ImportRowItem from './import-row'

interface AddExistingMovieModalProps {
  onClose: () => void
  onAdded: (movies: LibraryMovie[], fullySucceeded: boolean) => void
}

export default function AddExistingMovieModal({ onClose, onAdded }: AddExistingMovieModalProps) {
  const {
    rows,
    isCommitting,
    pickFiles,
    pickFolder,
    setQuery,
    setEditing,
    selectMovie,
    removeRow,
    commit
  } = useBatchImport(onAdded)

  const isIdle = !isCommitting && !rows.some((r) => r.status === 'matching')
  const matchedCount = useMemo(() => rows.filter((r) => r.status === 'matched').length, [rows])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isIdle) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isIdle, onClose])

  const hasRows = rows.length > 0

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={isIdle ? onClose : undefined}
    >
      <div
        className={`w-full ${hasRows ? 'max-w-3xl' : 'max-w-xl'} max-h-[85vh] flex flex-col rounded-2xl dark:ring-2 dark:ring-white/8 bg-custom-100 dark:bg-custom-900`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-custom-800 dark:text-custom-50">
              Add movies from device
            </h2>
            {hasRows && (
              <p className="mt-0.5 text-xs text-custom-500 dark:text-custom-400">
                {rows.length} file{rows.length === 1 ? '' : 's'} selected
                {matchedCount > 0 && ` • ${matchedCount} matched`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={!isIdle}
            className="flex h-8 w-8 items-center justify-center rounded-full text-custom-500 transition-colors bg-custom-50 dark:bg-transparent hover:text-custom-800 disabled:opacity-40 dark:hover:bg-custom-700 dark:hover:text-custom-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-3 flex-1 min-h-0 overflow-y-auto">
          {!hasRows ? (
            <DropZone onPickFiles={pickFiles} onPickFolder={pickFolder} />
          ) : (
            <div className="flex flex-col gap-2">
              {rows.map((row) => (
                <ImportRowItem
                  key={row.id}
                  row={row}
                  onSetEditing={setEditing}
                  onSetQuery={setQuery}
                  onSelectMovie={selectMovie}
                  onRemove={removeRow}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-5 border-t border-custom-200/60 dark:border-custom-700/60">
          {hasRows ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={pickFiles}
                  disabled={!isIdle}
                  className="flex items-center gap-1.5 rounded-xl border border-custom-200 bg-custom-50 px-3 py-2 text-xs font-medium text-custom-700 transition-colors hover:bg-custom-100 disabled:opacity-50 dark:border-custom-700 dark:bg-custom-800/40 dark:text-custom-200 dark:hover:bg-custom-700/60"
                >
                  <Plus size={14} />
                  Add more files
                </button>
                <button
                  onClick={pickFolder}
                  disabled={!isIdle}
                  className="flex items-center gap-1.5 rounded-xl border border-custom-200 bg-custom-50 px-3 py-2 text-xs font-medium text-custom-700 transition-colors hover:bg-custom-100 disabled:opacity-50 dark:border-custom-700 dark:bg-custom-800/40 dark:text-custom-200 dark:hover:bg-custom-700/60"
                >
                  <Plus size={14} />
                  Add folder
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  disabled={!isIdle}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-custom-600 transition-colors hover:text-custom-800 disabled:opacity-50 dark:text-custom-300 dark:hover:text-custom-50"
                >
                  Cancel
                </button>
                <button
                  onClick={commit}
                  disabled={matchedCount === 0 || !isIdle}
                  className="flex items-center gap-2 rounded-xl bg-custom-800 px-5 py-2.5 text-sm font-medium text-custom-50 transition-colors hover:bg-custom-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-custom-50 dark:text-custom-800 dark:hover:bg-custom-200"
                >
                  {isCommitting && (
                    <div className="h-4 w-4 rounded-full border-2 border-custom-50/30 border-t-custom-50 animate-spin dark:border-custom-800/30 dark:border-t-custom-800" />
                  )}
                  Add {matchedCount > 0 ? matchedCount : ''} to library
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onClose}
              className="ml-auto rounded-xl px-4 py-2.5 text-sm font-medium text-custom-600 transition-colors hover:text-custom-800 dark:text-custom-300 dark:hover:text-custom-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
