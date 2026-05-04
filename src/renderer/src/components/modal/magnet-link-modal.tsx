import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

interface MagnetLinkModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (magnetLink: string, name: string) => Promise<unknown>
}

export default function MagnetLinkModal({ open, onClose, onSubmit }: MagnetLinkModalProps) {
  const [magnetLink, setMagnetLink] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setMagnetLink('')
      setName('')
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Try to extract a display name from the magnet link (dn= parameter)
  useEffect(() => {
    if (!magnetLink.startsWith('magnet:')) return
    try {
      const params = new URLSearchParams(magnetLink.split('?')[1] || '')
      const dn = params.get('dn')
      if (dn) {
        setName((prev) => prev || dn)
      }
    } catch {
      // ignore parse errors
    }
  }, [magnetLink])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, loading, onClose])

  if (!open) return null

  const isValid = magnetLink.startsWith('magnet:') && name.trim().length > 0

  const handleSubmit = async () => {
    if (!isValid || loading) return
    setLoading(true)
    try {
      await onSubmit(magnetLink.trim(), name.trim())
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-custom-200 bg-custom-50 px-4 py-3 text-sm text-custom-800 placeholder-custom-400 transition-colors focus:outline-none focus:border-custom-400 dark:border-custom-700 dark:bg-custom-800/30 dark:text-custom-50 dark:placeholder-custom-600 dark:focus:border-custom-500'

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
            Add Magnet Link
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
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm text-custom-600 dark:text-custom-400">
              Magnet Link
            </label>
            <input
              ref={inputRef}
              type="text"
              value={magnetLink}
              onChange={(e) => setMagnetLink(e.target.value)}
              placeholder="magnet:?xt=urn:btih:..."
              className={inputClass}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="block text-sm text-custom-600 dark:text-custom-400">
              Download Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Download"
              className={inputClass}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
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
            {loading ? 'Starting…' : 'Start Download'}
          </button>
        </div>
      </div>
    </div>
  )
}
