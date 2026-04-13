import { create } from 'zustand'
import type { DownloadItem } from '@shared/types'
import { withErrorToast } from '../hooks/use-async-action'

interface DownloadsState {
  downloads: DownloadItem[]
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

export const useDownloadsStore = create<DownloadsState>((set) => ({
  downloads: [],
  init: () => {
    withErrorToast(() => window.api.download.list(), 'Failed to load downloads').then((items) => {
      if (items) set({ downloads: items })
    })
    const unsubscribe = window.api.download.onProgress((items) => {
      set({ downloads: items })
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
