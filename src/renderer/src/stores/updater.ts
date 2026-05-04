import { create } from 'zustand'
import type { UpdaterStatus } from '@shared/types'
import { withErrorToast } from '../hooks/use-async-action'

interface UpdaterState {
  status: UpdaterStatus | null
  init: () => () => void
  check: () => Promise<void>
  download: () => Promise<void>
  install: () => Promise<void>
}

export const useUpdaterStore = create<UpdaterState>((set) => ({
  status: null,
  init: () => {
    window.api.updater
      .status()
      .then((s) => set({ status: s }))
      .catch(() => {})
    const unsubscribe = window.api.updater.onStatus((status) => {
      set({ status })
    })
    return unsubscribe
  },
  check: async () => {
    const next = await withErrorToast(
      () => window.api.updater.check(),
      'Failed to check for updates'
    )
    if (next) set({ status: next })
  },
  download: async () => {
    const next = await withErrorToast(
      () => window.api.updater.download(),
      'Failed to download update'
    )
    if (next) set({ status: next })
  },
  install: async () => {
    await withErrorToast(() => window.api.updater.install(), 'Failed to install update')
  }
}))

export const isUpdateAvailable = (status: UpdaterStatus | null): boolean => {
  if (!status) return false
  return (
    status.phase === 'available' || status.phase === 'downloading' || status.phase === 'downloaded'
  )
}
