import { useEffect, useState } from 'react'
import { FolderOpen, Key, Trash2, Info, AlertTriangle } from 'lucide-react'
import { useSettingsStore } from '../stores/settings'
import { useUpdaterStore } from '../stores/updater'
import { useAsyncAction } from '../hooks/use-async-action'
import SettingsTopBar from '../components/layout/settings-top-bar'
import UpdatesSection from '../components/settings/updates-section'
import ConfirmModal from '../components/modal/confirm-modal'

const sectionCardClass =
  'mt-3 rounded-xl border border-custom-300 bg-custom-50/60 p-4 dark:border-custom-700/70 dark:bg-custom-800/60'

const sectionTitleClass =
  'text-sm font-semibold uppercase tracking-wider text-custom-500 dark:text-custom-400'

const fieldLabelClass = 'text-sm font-medium text-custom-700 dark:text-custom-200'

const helperTextClass = 'text-xs text-custom-500 dark:text-custom-500'

const dividerClass = 'mt-4 pt-4 border-t border-custom-200 dark:border-custom-700/60'

const inputClass =
  'rounded-lg border border-custom-200 bg-custom-50 px-3 py-2 text-sm text-custom-800 placeholder-custom-400 transition-colors focus:outline-none focus:border-custom-400 dark:border-custom-700 dark:bg-custom-800/30 dark:text-custom-50 dark:placeholder-custom-600 dark:focus:border-custom-500'

const secondaryButtonClass =
  'flex items-center gap-1.5 rounded-lg border border-custom-200 bg-custom-50 px-3 py-2 text-sm text-custom-700 transition-colors hover:bg-custom-100 dark:border-custom-700 dark:bg-custom-800/30 dark:text-custom-200 dark:hover:bg-custom-700/50'

export default function Settings() {
  const { settings, saved, load, update, pickFolder, pickPlayer } = useSettingsStore()
  const [apiKeyDraft, setApiKeyDraft] = useState('')
  const [subtitleKeyDraft, setSubtitleKeyDraft] = useState('')
  const [clearLibraryOpen, setClearLibraryOpen] = useState(false)

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (settings) {
      setApiKeyDraft(settings.tmdbApiKey)
      const key =
        settings.subtitleProvider === 'subdl' ? settings.subdlApiKey : settings.openSubtitlesApiKey
      setSubtitleKeyDraft(key)
    }
  }, [settings])

  const run = useAsyncAction()

  const handleClearLibrary = () => {
    setClearLibraryOpen(false)
    run(() => window.api.library.clear(), 'Failed to clear library', {
      successMessage: 'Library cleared'
    })
  }

  const appVersion = useUpdaterStore((s) => s.status?.currentVersion)

  if (!settings) return null

  return (
    <div className="flex-1 p-6 pt-10 overflow-y-auto max-w-2xl">
      <SettingsTopBar />

      <UpdatesSection />

      {/* API Key */}
      <section className="mt-6">
        <h2 className={sectionTitleClass}>API</h2>
        <div className={sectionCardClass}>
          <label className={`${fieldLabelClass} flex items-center gap-1.5`}>
            <Key size={14} /> TMDB API Key
          </label>
          <input
            type="text"
            value={apiKeyDraft}
            onChange={(e) => setApiKeyDraft(e.target.value)}
            onBlur={(e) => update('tmdbApiKey', e.target.value)}
            className={`mt-2 w-full ${inputClass}`}
            placeholder="Enter your TMDB API key..."
          />
          {saved === 'tmdbApiKey' && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Saved</p>
          )}
          {!apiKeyDraft && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1.5 flex items-center gap-1">
              <AlertTriangle size={12} /> Required &mdash; movie search, details, and trending
              won&apos;t work without a key.
            </p>
          )}
          <p className={`${helperTextClass} mt-1.5`}>
            Get a free key at{' '}
            <span className="text-custom-700 dark:text-custom-300">themoviedb.org</span>
          </p>

          {/* Subtitle Provider */}
          <div className={dividerClass}>
            <label className={fieldLabelClass}>Subtitle Provider</label>
            <div className="flex items-center gap-1 mt-2 rounded-lg border border-custom-200 bg-custom-50 p-1 dark:border-custom-700 dark:bg-custom-800/30">
              <button
                onClick={() => {
                  update('subtitleProvider', 'subdl')
                  setSubtitleKeyDraft(settings.subdlApiKey)
                }}
                className={`flex-1 text-sm px-3 py-1.5 rounded-md transition-colors ${
                  settings.subtitleProvider === 'subdl'
                    ? 'bg-custom-800 text-custom-50 dark:bg-custom-50 dark:text-custom-800'
                    : 'text-custom-500 hover:text-custom-800 dark:text-custom-400 dark:hover:text-custom-100'
                }`}
              >
                Subdl
              </button>
              <button
                onClick={() => {
                  update('subtitleProvider', 'opensubtitles')
                  setSubtitleKeyDraft(settings.openSubtitlesApiKey)
                }}
                className={`flex-1 text-sm px-3 py-1.5 rounded-md transition-colors ${
                  settings.subtitleProvider === 'opensubtitles'
                    ? 'bg-custom-800 text-custom-50 dark:bg-custom-50 dark:text-custom-800'
                    : 'text-custom-500 hover:text-custom-800 dark:text-custom-400 dark:hover:text-custom-100'
                }`}
              >
                OpenSubtitles
              </button>
            </div>
            {saved === 'subtitleProvider' && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Saved</p>
            )}

            <label className={`${fieldLabelClass} flex items-center gap-1.5 mt-3`}>
              <Key size={14} /> {settings.subtitleProvider === 'subdl' ? 'Subdl' : 'OpenSubtitles'}{' '}
              API Key
            </label>
            <input
              type="text"
              value={subtitleKeyDraft}
              onChange={(e) => setSubtitleKeyDraft(e.target.value)}
              onBlur={(e) => {
                const field =
                  settings.subtitleProvider === 'subdl' ? 'subdlApiKey' : 'openSubtitlesApiKey'
                update(field, e.target.value)
              }}
              className={`mt-2 w-full ${inputClass}`}
              placeholder={`Enter your ${settings.subtitleProvider === 'subdl' ? 'Subdl' : 'OpenSubtitles'} API key...`}
            />
            {(saved === 'openSubtitlesApiKey' || saved === 'subdlApiKey') && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Saved</p>
            )}
            <p className={`${helperTextClass} mt-1.5`}>
              Optional — enables searching subtitles online. Get a key at{' '}
              <span className="text-custom-700 dark:text-custom-300">
                {settings.subtitleProvider === 'subdl' ? 'subdl.com' : 'opensubtitles.com'}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* External Player */}
      <section className="mt-6">
        <h2 className={sectionTitleClass}>Player</h2>
        <div className={sectionCardClass}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <label className={fieldLabelClass}>Use External Video Player</label>
              <p className={`${helperTextClass} mt-0.5`}>
                When on, movies and streams open in the player below instead of the built-in one.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.externalPlayerEnabled}
              onClick={() => update('externalPlayerEnabled', !settings.externalPlayerEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                settings.externalPlayerEnabled
                  ? 'bg-custom-800 dark:bg-custom-50'
                  : 'bg-custom-300 dark:bg-custom-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform dark:bg-custom-900 ${
                  settings.externalPlayerEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          {saved === 'externalPlayerEnabled' && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Saved</p>
          )}

          <div className={dividerClass}>
            <label
              className={`${fieldLabelClass} ${settings.externalPlayerEnabled ? '' : 'opacity-50'}`}
            >
              External Video Player
            </label>
            <div
              className={`flex items-center gap-2 mt-2 ${
                settings.externalPlayerEnabled ? '' : 'opacity-50'
              }`}
            >
              <input
                type="text"
                readOnly
                disabled={!settings.externalPlayerEnabled}
                value={settings.externalPlayerPath}
                placeholder="No player selected"
                className={`flex-1 ${inputClass}`}
              />
              <button
                onClick={pickPlayer}
                disabled={!settings.externalPlayerEnabled}
                className={`${secondaryButtonClass} disabled:cursor-not-allowed`}
              >
                Browse
              </button>
              <button
                onClick={() => update('externalPlayerPath', '')}
                disabled={!settings.externalPlayerEnabled || !settings.externalPlayerPath}
                className={`${secondaryButtonClass} disabled:cursor-not-allowed`}
              >
                Clear
              </button>
            </div>
            {saved === 'externalPlayerPath' && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Saved</p>
            )}
            <p className={`${helperTextClass} mt-1.5`}>
              Choose a third-party player executable (e.g. VLC, mpv) to open movies and streams
              with.
            </p>
          </div>
        </div>
      </section>

      {/* Download Location */}
      <section className="mt-6">
        <h2 className={sectionTitleClass}>Downloads</h2>
        <div className={sectionCardClass}>
          <label className={fieldLabelClass}>Download Location</label>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              readOnly
              value={settings.downloadPath}
              className={`flex-1 ${inputClass}`}
            />
            <button onClick={pickFolder} className={secondaryButtonClass}>
              <FolderOpen size={14} /> Browse
            </button>
          </div>
          {saved === 'downloadPath' && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Saved</p>
          )}

          {/* Max concurrent downloads */}
          <div className={dividerClass}>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <label className={fieldLabelClass}>Max Concurrent Downloads</label>
                <p className={`${helperTextClass} mt-0.5`}>
                  Additional downloads will be queued and start automatically when a slot opens.
                </p>
              </div>
              <input
                type="number"
                min={1}
                max={4}
                value={settings.maxConcurrentDownloads}
                onChange={(e) => {
                  const next = Math.max(1, Math.min(4, Number(e.target.value) || 1))
                  update('maxConcurrentDownloads', next)
                }}
                className={`w-20 shrink-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${inputClass}`}
              />
            </div>
            {saved === 'maxConcurrentDownloads' && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Saved</p>
            )}
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="mt-6">
        <h2 className={sectionTitleClass}>Data</h2>
        <div className={sectionCardClass}>
          <button
            onClick={() => setClearLibraryOpen(true)}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} /> Clear Library
          </button>
          <p className={`${helperTextClass} mt-1`}>
            Removes all entries from your library. Downloaded files are not affected.
          </p>
        </div>
      </section>

      {/* App info */}
      <section className="mt-6 mb-10">
        <div className="flex items-center gap-2 text-xs text-custom-500 dark:text-custom-500">
          <Info size={12} />
          <span>Cerberus{appVersion ? ` v${appVersion}` : ''} — Built with Electron</span>
        </div>
      </section>

      <ConfirmModal
        open={clearLibraryOpen}
        title="Clear library?"
        message="Removes all entries from your library. Downloaded files on disk are not affected."
        confirmLabel="Clear library"
        destructive
        onConfirm={handleClearLibrary}
        onCancel={() => setClearLibraryOpen(false)}
      />
    </div>
  )
}
