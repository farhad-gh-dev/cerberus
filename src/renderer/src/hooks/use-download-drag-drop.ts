import { useRef, useState } from 'react'
import { useDownloadsStore } from '../stores/downloads'
import type { DownloadItem } from '@shared/types'

export type Section = 'active' | 'queued' | 'on-hold' | 'completed' | 'error'

const DRAGGABLE: Section[] = ['active', 'queued', 'on-hold']
const DROPPABLE: Section[] = ['active', 'queued', 'on-hold']

export function sectionOf(item: DownloadItem): Section {
  if (item.status === 'downloading') return 'active'
  if (item.status === 'queued' || item.status === 'paused') return 'queued'
  if (item.status === 'on-hold') return 'on-hold'
  if (item.status === 'completed') return 'completed'
  return 'error'
}

/** Apply the state transition for moving a download between sections. */
function applyTransition(
  src: Section,
  dest: Section,
  id: string,
  ops: {
    hold: (id: string) => Promise<unknown>
    unhold: (id: string) => Promise<unknown>
    resume: (id: string) => Promise<unknown>
  }
): void {
  if (dest === 'on-hold') ops.hold(id)
  else if (dest === 'queued') {
    if (src === 'on-hold') ops.unhold(id)
    else if (src === 'active') ops.hold(id).then(() => ops.unhold(id))
  } else if (dest === 'active') {
    if (src === 'on-hold') ops.unhold(id).then(() => ops.resume(id))
    else if (src === 'queued') ops.resume(id)
  }
}

export function useDownloadDragDrop() {
  const downloads = useDownloadsStore((s) => s.downloads)
  const reorderQueue = useDownloadsStore((s) => s.reorderQueue)
  const { resume, hold, unhold } = useDownloadsStore()
  const ops = { hold, unhold, resume }

  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [dragOverSection, setDragOverSection] = useState<Section | null>(null)
  const rowCtr = useRef<Record<string, number>>({})
  const secCtr = useRef<Record<string, number>>({})

  const queued = downloads
    .filter((d) => d.status === 'queued')
    .sort((a, b) => a.priority - b.priority)
  const dragSourceSection = dragId ? sectionOf(downloads.find((d) => d.id === dragId)!) : null

  function resetDrag() {
    setDragId(null)
    setDragOverId(null)
    setDragOverSection(null)
    rowCtr.current = {}
    secCtr.current = {}
  }

  /** Resolve source item from a drop event. */
  function resolveSource(e: React.DragEvent) {
    const id = e.dataTransfer.getData('text/plain')
    const item = id ? downloads.find((d) => d.id === id) : undefined
    return item ? { id, section: sectionOf(item) } : null
  }

  function onSectionDrop(target: Section) {
    return (e: React.DragEvent) => {
      e.preventDefault()
      const src = resolveSource(e)
      if (src && src.section !== target) applyTransition(src.section, target, src.id, ops)
      resetDrag()
    }
  }

  function onQueueRowDrop(targetId: string) {
    return (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const src = resolveSource(e)
      if (!src || src.id === targetId) {
        resetDrag()
        return
      }

      if (src.section === 'queued') {
        const ids = queued.map((d) => d.id)
        const from = ids.indexOf(src.id),
          to = ids.indexOf(targetId)
        if (from !== -1 && to !== -1) {
          const r = [...ids]
          r.splice(from, 1)
          r.splice(to, 0, src.id)
          reorderQueue(r)
        }
      } else {
        applyTransition(src.section, 'queued', src.id, ops)
      }
      resetDrag()
    }
  }

  // --- Public API ---

  function showDropIndicator(section: Section): boolean {
    return (
      !!dragId &&
      !!dragSourceSection &&
      dragSourceSection !== section &&
      DROPPABLE.includes(section) &&
      dragOverSection === section
    )
  }

  function sectionDropProps(section: Section) {
    return {
      onDragOver: (e: React.DragEvent) => {
        if (!DROPPABLE.includes(section)) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      },
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault()
        secCtr.current[section] = (secCtr.current[section] ?? 0) + 1
        if (DROPPABLE.includes(section)) setDragOverSection(section)
      },
      onDragLeave: (e: React.DragEvent) => {
        e.preventDefault()
        secCtr.current[section] = (secCtr.current[section] ?? 0) - 1
        if (secCtr.current[section]! <= 0) {
          secCtr.current[section] = 0
          if (dragOverSection === section) setDragOverSection(null)
        }
      },
      onDrop: onSectionDrop(section)
    }
  }

  function rowDragProps(item: DownloadItem, section: Section) {
    const id = item.id
    return {
      draggable: DRAGGABLE.includes(sectionOf(item)),
      isDragging: dragId === id,
      isDragOver: dragOverId === id,
      onDragStart: (e: React.DragEvent) => {
        setDragId(id)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', id)
      },
      onDragEnd: resetDrag,
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (id !== dragId) setDragOverId(id)
      },
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault()
        rowCtr.current[id] = (rowCtr.current[id] ?? 0) + 1
      },
      onDragLeave: (e: React.DragEvent) => {
        e.preventDefault()
        rowCtr.current[id] = (rowCtr.current[id] ?? 0) - 1
        if (rowCtr.current[id]! <= 0) {
          rowCtr.current[id] = 0
          if (dragOverId === id) setDragOverId(null)
        }
      },
      onDrop: onSectionDrop(section)
    }
  }

  function queueRowDragProps(item: DownloadItem) {
    return {
      ...rowDragProps(item, 'queued'),
      draggable: true as const,
      onDrop: onQueueRowDrop(item.id)
    }
  }

  return {
    dragId,
    dragSourceSection,
    showDropIndicator,
    sectionDropProps,
    rowDragProps,
    queueRowDragProps
  }
}
