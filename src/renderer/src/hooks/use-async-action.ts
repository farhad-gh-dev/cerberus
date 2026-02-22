import { useCallback } from 'react'
import { useToastStore } from '../stores/toast'

/**
 * Hook for components: wraps an async action with automatic error toasting.
 * Returns a `run` function that executes the action, catches errors, and shows a toast.
 *
 * Usage:
 *   const run = useAsyncAction()
 *   await run(() => window.api.library.remove(id), 'Failed to remove movie', {
 *     onSuccess: () => navigate('/library')
 *   })
 */
export function useAsyncAction() {
  const addToast = useToastStore((s) => s.addToast)

  const run = useCallback(
    async <T>(
      action: () => Promise<T>,
      errorMessage: string,
      options?: { onSuccess?: (result: T) => void; successMessage?: string }
    ): Promise<T | undefined> => {
      try {
        const result = await action()
        if (options?.successMessage) addToast(options.successMessage, 'success')
        options?.onSuccess?.(result)
        return result
      } catch {
        addToast(errorMessage, 'error')
        return undefined
      }
    },
    [addToast]
  )

  return run
}

/**
 * Standalone utility for Zustand stores (can't use React hooks).
 * Wraps an async action with automatic error toasting.
 *
 * Usage:
 *   return await withErrorToast(
 *     () => window.api.download.start(magnetLink, name, imdbId),
 *     'Failed to start download'
 *   )
 */
export async function withErrorToast<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T | undefined> {
  try {
    return await action()
  } catch {
    useToastStore.getState().addToast(errorMessage, 'error')
    return undefined
  }
}
