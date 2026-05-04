import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { DownloadItem } from '@shared/types'
import { withErrorToast } from '../hooks/use-async-action'

interface DownloadsState {
  ids: string[]
  byId: Record<string, DownloadItem>
  init: () => () => void
  start: (magnetLink: string, name: string, imdbId?: string) => Promise<string | undefined>
  startMagnet: (magnetLink: string, name: string) => Promise<string | undefined>
  pause: (id: string) => Promise<boolean | undefined>
  resume: (id: string) => Promise<boolean | undefined>
  cancel: (id: string) => Promise<boolean | undefined>
  delete: (id: string) => Promise<boolean | undefined>
  hold: (id: string) => Promise<boolean | undefined>
  unhold: (id: string) => Promise<boolean | undefined>
  moveInQueue: (id: string, direction: 'up' | 'down') => Promise<boolean | undefined>
  reorderQueue: (orderedIds: string[]) => Promise<boolean | undefined>
}

// Keeps ids and per-row byId references stable so memoised rows don't re-render
// on every progress tick — only items whose fields actually changed produce new refs.
function applySnapshot(
  state: { ids: string[]; byId: Record<string, DownloadItem> },
  items: DownloadItem[]
): Partial<DownloadsState> {
  const nextIds: string[] = new Array(items.length)
  const nextById: Record<string, DownloadItem> = {}
  let idsChanged = items.length !== state.ids.length

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    nextIds[i] = item.id
    if (!idsChanged && state.ids[i] !== item.id) idsChanged = true

    const prev = state.byId[item.id]
    if (prev && shallowEqualItem(prev, item)) {
      nextById[item.id] = prev
    } else {
      nextById[item.id] = item
    }
  }

  if (!idsChanged) {
    let any = false
    for (const id of nextIds) {
      if (nextById[id] !== state.byId[id]) {
        any = true
        break
      }
    }
    if (!any) return {}
  }

  return { ids: idsChanged ? nextIds : state.ids, byId: nextById }
}

function shallowEqualItem(a: DownloadItem, b: DownloadItem): boolean {
  return (
    a.status === b.status &&
    a.progress === b.progress &&
    a.downloadSpeed === b.downloadSpeed &&
    a.uploadSpeed === b.uploadSpeed &&
    a.downloaded === b.downloaded &&
    a.totalSize === b.totalSize &&
    a.timeRemaining === b.timeRemaining &&
    a.peers === b.peers &&
    a.priority === b.priority &&
    a.completedAt === b.completedAt &&
    a.name === b.name
  )
}

export const useDownloadsStore = create<DownloadsState>((set) => ({
  ids: [],
  byId: {},
  init: () => {
    withErrorToast(() => window.api.download.list(), 'Failed to load downloads').then((items) => {
      if (items) set((s) => applySnapshot(s, items))
    })
    const unsubscribe = window.api.download.onProgress((items) => {
      set((s) => applySnapshot(s, items as DownloadItem[]))
    })
    return unsubscribe
  },
  start: (magnetLink, name, imdbId) =>
    withErrorToast(
      () => window.api.download.start(magnetLink, name, imdbId),
      'Failed to start download'
    ),
  startMagnet: (magnetLink, name) =>
    withErrorToast(
      () => window.api.download.startMagnet(magnetLink, name),
      'Failed to start magnet download'
    ),
  pause: (id) => withErrorToast(() => window.api.download.pause(id), 'Failed to pause download'),
  resume: (id) => withErrorToast(() => window.api.download.resume(id), 'Failed to resume download'),
  cancel: (id) => withErrorToast(() => window.api.download.cancel(id), 'Failed to cancel download'),
  delete: (id) => withErrorToast(() => window.api.download.delete(id), 'Failed to delete download'),
  hold: (id) => withErrorToast(() => window.api.download.hold(id), 'Failed to hold download'),
  unhold: (id) => withErrorToast(() => window.api.download.unhold(id), 'Failed to unhold download'),
  moveInQueue: (id, direction) =>
    withErrorToast(() => window.api.download.moveInQueue(id, direction), 'Failed to reorder queue'),
  reorderQueue: (orderedIds) =>
    withErrorToast(() => window.api.download.reorderQueue(orderedIds), 'Failed to reorder queue')
}))

export function useDownloads(): DownloadItem[] {
  return useDownloadsStore(useShallow((s) => s.ids.map((id) => s.byId[id])))
}

export function useDownloadById(id: string | undefined): DownloadItem | undefined {
  return useDownloadsStore((s) => (id ? s.byId[id] : undefined))
}
export function getDownloadsSnapshot(): DownloadItem[] {
  const s = useDownloadsStore.getState()
  return s.ids.map((id) => s.byId[id])
}
