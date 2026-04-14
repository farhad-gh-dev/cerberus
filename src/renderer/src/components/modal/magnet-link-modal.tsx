import { useState, useRef, useEffect } from 'react'
import { X, Link, Loader2 } from 'lucide-react'

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
      if (dn && !name) {
        setName(dn)
      }
    } catch {
      // ignore parse errors
    }
  }, [magnetLink])

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
            <Link size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Add Magnet Link</h2>
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
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        {/* Name input */}
        <label className="block text-sm text-zinc-400 mb-1.5 mt-4">Download Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My Download"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

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
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Starting…' : 'Start Download'}
          </button>
        </div>
      </div>
    </div>
  )
}
