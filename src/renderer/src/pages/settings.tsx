import { useEffect, useState } from 'react'
import {
  Settings as SettingsIcon,
  FolderOpen,
  Key,
  Trash2,
  Info,
  AlertTriangle
} from 'lucide-react'
import { useSettingsStore } from '../stores/settings'
import { useAsyncAction } from '../hooks/use-async-action'

export default function Settings() {
  const { settings, saved, load, update, pickFolder, pickPlayer } = useSettingsStore()
  const [apiKeyDraft, setApiKeyDraft] = useState('')

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (settings) setApiKeyDraft(settings.tmdbApiKey)
  }, [settings])

  const run = useAsyncAction()

  const handleClearLibrary = () => {
    if (confirm('Remove all movies from your library? Files on disk will not be deleted.')) {
      run(() => window.api.library.clear(), 'Failed to clear library', {
        successMessage: 'Library cleared'
      })
    }
  }

  if (!settings) return null

  return (
    <div className="flex-1 p-6 pt-10 overflow-y-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <SettingsIcon size={24} /> Settings
      </h1>

      {/* Download Location */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Downloads</h2>
        <div className="mt-3 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <label className="text-sm text-zinc-300 font-medium">Download Location</label>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              readOnly
              value={settings.downloadPath}
              className="flex-1 bg-zinc-800 text-zinc-300 text-sm px-3 py-2 rounded-lg border border-zinc-700"
            />
            <button
              onClick={pickFolder}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-3 py-2 rounded-lg border border-zinc-700 transition-colors"
            >
              <FolderOpen size={14} /> Browse
            </button>
          </div>
          {saved === 'downloadPath' && <p className="text-xs text-green-400 mt-1">Saved</p>}
        </div>
      </section>

      {/* External Player */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Player</h2>
        <div className="mt-3 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <label className="text-sm text-zinc-300 font-medium">External Video Player</label>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              readOnly
              value={settings.externalPlayerPath}
              className="flex-1 bg-zinc-800 text-zinc-300 text-sm px-3 py-2 rounded-lg border border-zinc-700"
            />
            <button
              onClick={pickPlayer}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-3 py-2 rounded-lg border border-zinc-700 transition-colors"
            >
              Browse
            </button>
            <button
              onClick={() => update('externalPlayerPath', '')}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-3 py-2 rounded-lg border border-zinc-700 transition-colors"
            >
              Clear
            </button>
          </div>
          {saved === 'externalPlayerPath' && <p className="text-xs text-green-400 mt-1">Saved</p>}
          <p className="text-xs text-zinc-600 mt-1.5">
            Optional: Choose a third-party player to open movies with.
          </p>
        </div>
      </section>

      {/* API Key */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">API</h2>
        <div className="mt-3 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <label className="text-sm text-zinc-300 font-medium flex items-center gap-1.5">
            <Key size={14} /> TMDB API Key
          </label>
          <input
            type="text"
            value={apiKeyDraft}
            onChange={(e) => setApiKeyDraft(e.target.value)}
            onBlur={(e) => update('tmdbApiKey', e.target.value)}
            className="mt-2 w-full bg-zinc-800 text-zinc-300 text-sm px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-blue-500"
            placeholder="Enter your TMDB API key..."
          />
          {saved === 'tmdbApiKey' && <p className="text-xs text-green-400 mt-1">Saved</p>}
          {!apiKeyDraft && (
            <p className="text-xs text-yellow-400 mt-1.5 flex items-center gap-1">
              <AlertTriangle size={12} /> Required &mdash; movie search, details, and trending
              won&apos;t work without a key.
            </p>
          )}
          <p className="text-xs text-zinc-600 mt-1.5">
            Get a free key at <span className="text-zinc-400">themoviedb.org</span>
          </p>
        </div>
      </section>

      {/* Danger zone */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Data</h2>
        <div className="mt-3 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <button
            onClick={handleClearLibrary}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} /> Clear Library
          </button>
          <p className="text-xs text-zinc-600 mt-1">
            Removes all entries from your library. Downloaded files are not affected.
          </p>
        </div>
      </section>

      {/* App info */}
      <section className="mt-6 mb-10">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <Info size={12} />
          <span>Cerberus v0.1.0 — Built with Electron</span>
        </div>
      </section>
    </div>
  )
}
