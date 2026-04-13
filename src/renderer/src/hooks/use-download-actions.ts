import { useCallback } from 'react'
import { useDownloadsStore } from '../stores/downloads'

/** Memoised action dispatchers scoped to a single download id. */
export function useDownloadActions(id: string) {
  const { pause, resume, cancel, delete: del, hold, unhold } = useDownloadsStore()

  return {
    pause: useCallback(() => pause(id), [pause, id]),
    resume: useCallback(() => resume(id), [resume, id]),
    cancel: useCallback(() => cancel(id), [cancel, id]),
    delete: useCallback(() => del(id), [del, id]),
    hold: useCallback(() => hold(id), [hold, id]),
    unhold: useCallback(() => unhold(id), [unhold, id])
  }
}
