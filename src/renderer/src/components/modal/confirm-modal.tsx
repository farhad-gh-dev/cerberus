import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  const confirmClass = destructive
    ? 'text-white bg-red-500 hover:bg-red-600'
    : 'text-custom-50 bg-custom-800 hover:bg-custom-700 dark:text-custom-800 dark:bg-custom-50 dark:hover:bg-custom-200'

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
            {destructive && (
              <div className="w-10 h-10 rounded-full bg-red-500/15 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
              </div>
            )}
            <h2 className="text-lg font-semibold text-custom-800 dark:text-custom-50">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-custom-500 hover:text-custom-800 hover:bg-custom-200 dark:text-custom-400 dark:hover:text-custom-50 dark:hover:bg-custom-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-custom-600 dark:text-custom-300 mb-6">{message}</p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-custom-700 hover:text-custom-800 bg-custom-200 hover:bg-custom-300 dark:text-white/70 dark:hover:text-white dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
