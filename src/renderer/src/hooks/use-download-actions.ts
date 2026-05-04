import { useCallback } from 'react'
import { useDownloadsStore } from '../stores/downloads'

// Each action is selected individually so the hook does not subscribe to the
// full store, which would re-render every row on every progress tick.
export function useDownloadActions(id: string) {
  const pause = useDownloadsStore((s) => s.pause)
  const resume = useDownloadsStore((s) => s.resume)
  const cancel = useDownloadsStore((s) => s.cancel)
  const del = useDownloadsStore((s) => s.delete)
  const hold = useDownloadsStore((s) => s.hold)
  const unhold = useDownloadsStore((s) => s.unhold)

  return {
    pause: useCallback(() => pause(id), [pause, id]),
    resume: useCallback(() => resume(id), [resume, id]),
    cancel: useCallback(() => cancel(id), [cancel, id]),
    delete: useCallback(() => del(id), [del, id]),
    hold: useCallback(() => hold(id), [hold, id]),
    unhold: useCallback(() => unhold(id), [unhold, id])
  }
}
