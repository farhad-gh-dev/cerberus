import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'
import Toast from '../ui/toast'
import ErrorBoundary from '../ui/error-boundary'
import { Minus, Square, X } from 'lucide-react'
import { useDownloadsStore } from '../../stores/downloads'
import { useUpdaterStore } from '../../stores/updater'

export default function Layout() {
  const init = useDownloadsStore((s) => s.init)
  const initUpdater = useUpdaterStore((s) => s.init)

  useEffect(() => {
    const unsubscribe = init()
    return unsubscribe
  }, [init])

  useEffect(() => {
    const unsubscribe = initUpdater()
    return unsubscribe
  }, [initUpdater])

  return (
    <div className="flex h-screen overflow-hidden bg-custom-100 text-custom-800 dark:bg-custom-900 dark:text-custom-50">
      <div className="absolute top-0 left-0 right-0 h-8 [-webkit-app-region:drag] z-50 flex items-center justify-end">
        <div className="flex [-webkit-app-region:no-drag]">
          <button
            onClick={() => window.api.window.minimize()}
            className="h-8 w-11 flex items-center justify-center transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.api.window.maximize()}
            className="h-8 w-11 flex items-center justify-center transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => window.api.window.close()}
            className="h-8 w-11 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <Sidebar />
      <main className="flex-1 overflow-y-auto [scrollbar-gutter:stable] p-3 pr-0 pl-3">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Toast />
    </div>
  )
}
