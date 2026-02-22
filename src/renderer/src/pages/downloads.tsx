import { useState } from 'react'
import { Download, Link } from 'lucide-react'
import { useDownloadsStore } from '../stores/downloads'
import EmptyState from '../components/empty-state'
import DownloadRow from '../components/download-row'
import MagnetLinkModal from '../components/magnet-link-modal'

export default function Downloads() {
  const downloads = useDownloadsStore((s) => s.downloads)
  const startMagnet = useDownloadsStore((s) => s.startMagnet)
  const [magnetModalOpen, setMagnetModalOpen] = useState(false)

  const active = downloads.filter((d) => d.status === 'downloading' || d.status === 'paused')
  const completed = downloads.filter((d) => d.status === 'completed')
  const errored = downloads.filter((d) => d.status === 'error')

  return (
    <div className="p-6 pt-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Downloads</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {active.length} active, {completed.length} completed
          </p>
        </div>
        <button
          onClick={() => setMagnetModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
        >
          <Link size={16} />
          Add Magnet Link
        </button>
      </div>

      <MagnetLinkModal
        open={magnetModalOpen}
        onClose={() => setMagnetModalOpen(false)}
        onSubmit={(magnetLink, name) => startMagnet(magnetLink, name)}
      />

      {downloads.length === 0 && (
        <EmptyState
          icon={<Download size={40} />}
          title="No downloads yet"
          subtitle="Find a movie and start downloading"
          className="mt-24"
        />
      )}

      {/* Active downloads */}
      {active.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Active
          </h2>
          <div className="flex flex-col gap-2">
            {active.map((dl) => (
              <DownloadRow key={dl.id} item={dl} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Completed
          </h2>
          <div className="flex flex-col gap-2">
            {completed.map((dl) => (
              <DownloadRow key={dl.id} item={dl} />
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errored.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Failed
          </h2>
          <div className="flex flex-col gap-2">
            {errored.map((dl) => (
              <DownloadRow key={dl.id} item={dl} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
