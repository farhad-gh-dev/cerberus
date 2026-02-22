import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ApiKeyWarning() {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-400">
      <AlertTriangle size={18} className="shrink-0" />
      <span>
        TMDB API key not set &mdash; search, trending, and movie details are disabled.{' '}
        <Link to="/settings" className="underline hover:text-yellow-300">
          Add your key in Settings
        </Link>
      </span>
    </div>
  )
}
