import { useState, useRef, useEffect } from 'react'
import { X, Radio, Loader2 } from 'lucide-react'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Stream Magnet Link</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        {/* Magnet link input */}
        <label className="block text-sm text-zinc-400 mb-1.5">Magnet Link</label>
        <input
          ref={inputRef}
          type="text"
          value={magnetLink}
          onChange={(e) => setMagnetLink(e.target.value)}
          placeholder="magnet:?xt=urn:btih:..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        <p className="text-xs text-zinc-500 mt-2">
          Paste a magnet link to stream the video directly without downloading.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Loading…' : 'Start Stream'}
          </button>
        </div>
      </div>
    </div>
  )
}
