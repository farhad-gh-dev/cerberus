import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'
import Toast from './toast'
import ErrorBoundary from './error-boundary'
import { Minus, Square, X } from 'lucide-react'
import { useDownloadsStore } from '../stores/downloads'

export default function Layout() {
  const init = useDownloadsStore((s) => s.init)

  useEffect(() => {
    const unsubscribe = init()
    return unsubscribe
  }, [init])

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-8 [-webkit-app-region:drag] z-50 flex items-center justify-end">
        <div className="flex [-webkit-app-region:no-drag]">
          <button
            onClick={() => window.api.window.minimize()}
            className="h-8 w-11 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.api.window.maximize()}
            className="h-8 w-11 flex items-center justify-center hover:bg-white/10 transition-colors"
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
      <main className="flex-1 overflow-y-auto">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Toast />
    </div>
  )
}
