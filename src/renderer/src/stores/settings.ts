import { create } from 'zustand'
import type { AppSettings } from '@shared/types'
import { withErrorToast } from '../hooks/use-async-action'
import { SAVED_FEEDBACK_DURATION } from '../utils/constants'

interface SettingsState {
  settings: AppSettings | null
  saved: string | null
  load: () => void
  update: (key: keyof AppSettings, value: string | boolean | number) => Promise<void>
  pickFolder: () => Promise<void>
  pickPlayer: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  saved: null,
  load: () => {
    withErrorToast(() => window.api.settings.getAll(), 'Failed to load settings').then((s) => {
      if (s) set({ settings: s })
    })
  },
  update: async (key, value) => {
    const result = await withErrorToast(
      () => window.api.settings.set(key, value),
      'Failed to save setting'
    )
    if (result !== undefined) {
      const prev = get().settings
      set({ settings: prev ? { ...prev, [key]: value } : prev, saved: key })
      setTimeout(() => set({ saved: null }), SAVED_FEEDBACK_DURATION)
    }
  },
  pickFolder: async () => {
    const folder = await withErrorToast(
      () => window.api.settings.pickFolder(),
      'Failed to pick folder'
    )
    if (folder) {
      await get().update('downloadPath', folder)
    }
  },
  pickPlayer: async () => {
    const player = await withErrorToast(
      () => window.api.settings.pickPlayer(),
      'Failed to pick player'
    )
    if (player) {
      await get().update('externalPlayerPath', player)
    }
  }
}))
