import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

interface StreamMagnetModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (magnetLink: string) => Promise<void>
}

export default function StreamMagnetModal({ open, onClose, onSubmit }: StreamMagnetModalProps) {
  const [magnetLink, setMagnetLink] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setMagnetLink('')
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, loading, onClose])

  if (!open) return null

  const isValid = magnetLink.startsWith('magnet:')

  const handleSubmit = async () => {
    if (!isValid || loading) return
    setLoading(true)
    try {
      await onSubmit(magnetLink.trim())
      onClose()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl dark:ring-2 dark:ring-white/8 bg-custom-100 dark:bg-custom-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <h2 className="text-lg font-semibold text-custom-800 dark:text-custom-50">
            Stream Magnet Link
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-full text-custom-500 transition-colors bg-custom-50 dark:bg-transparent hover:text-custom-800 disabled:opacity-40 dark:hover:bg-custom-700 dark:hover:text-custom-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-2 pb-3 flex flex-col gap-3">
          <label className="block text-sm text-custom-600 dark:text-custom-400">Magnet Link</label>
          <input
            ref={inputRef}
            type="text"
            value={magnetLink}
            onChange={(e) => setMagnetLink(e.target.value)}
            placeholder="magnet:?xt=urn:btih:..."
            className="w-full rounded-xl border border-custom-200 bg-custom-50 px-4 py-3 text-sm text-custom-800 placeholder-custom-400 transition-colors focus:outline-none focus:border-custom-400 dark:border-custom-700 dark:bg-custom-800/30 dark:text-custom-50 dark:placeholder-custom-600 dark:focus:border-custom-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <p className="text-xs text-custom-500 dark:text-custom-400">
            Paste a magnet link to stream the video directly without downloading.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 pt-4 pb-5">
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="flex items-center gap-2 rounded-xl bg-custom-800 px-5 py-2.5 text-sm font-medium text-custom-50 transition-colors hover:bg-custom-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-custom-50 dark:text-custom-800 dark:hover:bg-custom-200"
          >
            {loading && (
              <div className="h-4 w-4 rounded-full border-2 border-custom-50/30 border-t-custom-50 animate-spin dark:border-custom-800/30 dark:border-t-custom-800" />
            )}
            {loading ? 'Loading…' : 'Start Stream'}
          </button>
        </div>
      </div>
    </div>
  )
}
