import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Link, Radio } from 'lucide-react'
import { useDownloadsStore } from '../stores/downloads'
import { useDownloadDragDrop } from '../hooks/use-download-drag-drop'
import EmptyState from '../components/ui/empty-state'
import DownloadRow from '../components/download/download-row'
import MagnetLinkModal from '../components/modal/magnet-link-modal'
import StreamMagnetModal from '../components/modal/stream-magnet-modal'
import type { DownloadItem } from '@shared/types'

const SECTION_THEME = {
  active: {
    ring: 'ring-blue-500/40',
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/30',
    hintText: 'text-blue-400',
    emptyText: 'text-blue-400/60',
    hint: 'Drop to start',
    empty: 'Drop here to start downloading',
    mt: 'mt-6',
    mtDrop: 'mt-3'
  },
  queued: {
    ring: 'ring-zinc-400/40',
    bg: 'bg-zinc-500/5',
    border: 'border-zinc-500/30',
    hintText: 'text-zinc-300',
    emptyText: 'text-zinc-400/60',
    hint: 'Drop to queue',
    empty: 'Drop here to add to queue',
    mt: 'mt-6',
    mtDrop: 'mt-3'
  },
  'on-hold': {
    ring: 'ring-orange-500/40',
    bg: 'bg-orange-500/5',
    border: 'border-orange-500/30',
    hintText: 'text-orange-400',
    emptyText: 'text-orange-400/60',
    hint: 'Drop to hold',
    empty: 'Drop here to put on hold',
    mt: 'mt-8',
    mtDrop: 'mt-5'
  }
}

type DroppableSection = keyof typeof SECTION_THEME

function DragSection({
  section,
  items,
  title,
  subtitle,
  drag,
  children
}: {
  section: DroppableSection
  items: DownloadItem[]
  title: string
  subtitle?: string
  drag: ReturnType<typeof useDownloadDragDrop>
  children: React.ReactNode
}) {
  const dropping = drag.showDropIndicator(section)
  if (items.length === 0 && (drag.dragId === null || drag.dragSourceSection === section))
    return null
  const t = SECTION_THEME[section]

  return (
    <div
      className={`${dropping ? t.mtDrop : t.mt} rounded-xl transition-all ${
        dropping ? `ring-2 ${t.ring} ${t.bg} p-3 -m-3` : ''
      }`}
      {...drag.sectionDropProps(section)}
    >
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        {title}
        {dropping && (
          <span
            className={`text-xs font-normal ${t.hintText} normal-case tracking-normal animate-pulse`}
          >
            {t.hint}
          </span>
        )}
        {!dropping && subtitle && (
          <span className="text-xs font-normal text-zinc-600 normal-case tracking-normal">
            {subtitle}
          </span>
        )}
      </h2>
      <div className="flex flex-col gap-2">
        {items.length === 0 && dropping && (
          <div
            className={`border-2 border-dashed ${t.border} rounded-xl p-6 text-center text-sm ${t.emptyText}`}
          >
            {t.empty}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

function StaticSection({ title, items }: { title: string; items: DownloadItem[] }) {
  if (items.length === 0) return null
  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">{title}</h2>
      <div className="flex flex-col gap-2">
        {items.map((dl) => (
          <DownloadRow key={dl.id} item={dl} />
        ))}
      </div>
    </div>
  )
}

export default function Downloads() {
  const downloads = useDownloadsStore((s) => s.downloads)
  const startMagnet = useDownloadsStore((s) => s.startMagnet)
  const navigate = useNavigate()
  const [magnetModalOpen, setMagnetModalOpen] = useState(false)
  const [streamModalOpen, setStreamModalOpen] = useState(false)
  const drag = useDownloadDragDrop()

  const handleStreamMagnet = useCallback(
    async (magnetLink: string) => {
      const result = await window.api.stream.start(magnetLink)
      const params = new URLSearchParams({
        streamId: result.id,
        title: result.fileName,
        back: '/downloads'
      })
      navigate(`/player?${params.toString()}`)
    },
    [navigate]
  )

  const active = downloads.filter((d) => d.status === 'downloading')
  const queued = downloads
    .filter((d) => d.status === 'queued')
    .sort((a, b) => a.priority - b.priority)
  const onHold = downloads.filter((d) => d.status === 'on-hold')
  const completed = downloads.filter((d) => d.status === 'completed')
  const errored = downloads.filter((d) => d.status === 'error')

  return (
    <div className="p-6 pt-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Downloads</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {active.length} active
            {queued.length > 0 && `, ${queued.length} queued`}
            {onHold.length > 0 && `, ${onHold.length} on hold`}, {completed.length} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStreamModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
          >
            <Radio size={16} />
            Stream Magnet
          </button>
          <button
            onClick={() => setMagnetModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            <Link size={16} />
            Add Magnet Link
          </button>
        </div>
      </div>

      <MagnetLinkModal
        open={magnetModalOpen}
        onClose={() => setMagnetModalOpen(false)}
        onSubmit={(magnetLink, name) => startMagnet(magnetLink, name)}
      />

      <StreamMagnetModal
        open={streamModalOpen}
        onClose={() => setStreamModalOpen(false)}
        onSubmit={handleStreamMagnet}
      />

      {downloads.length === 0 && (
        <EmptyState
          icon={<Download size={40} />}
          title="No downloads yet"
          subtitle="Find a movie and start downloading"
          className="mt-24"
        />
      )}

      <DragSection section="active" items={active} title="Active" drag={drag}>
        {active.map((dl) => (
          <DownloadRow
            key={dl.id}
            item={dl}
            showQueueButton={queued.length > 0}
            {...drag.rowDragProps(dl, 'active')}
          />
        ))}
      </DragSection>

      <DragSection
        section="queued"
        items={queued}
        title="Queued"
        subtitle="— drag to reorder or between sections"
        drag={drag}
      >
        {queued.map((dl) => (
          <DownloadRow key={dl.id} item={dl} {...drag.queueRowDragProps(dl)} />
        ))}
      </DragSection>

      <DragSection section="on-hold" items={onHold} title="On Hold" drag={drag}>
        {onHold.map((dl) => (
          <DownloadRow key={dl.id} item={dl} {...drag.rowDragProps(dl, 'on-hold')} />
        ))}
      </DragSection>

      <StaticSection title="Completed" items={completed} />
      <StaticSection title="Failed" items={errored} />
    </div>
  )
}
