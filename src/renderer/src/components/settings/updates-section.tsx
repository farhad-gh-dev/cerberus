import { Download, RefreshCw, RotateCw, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useUpdaterStore } from '../../stores/updater'

const sectionCardClass =
  'mt-3 rounded-xl border border-custom-300 bg-custom-50/60 p-4 dark:border-custom-700/70 dark:bg-custom-800/60'

const sectionTitleClass =
  'text-sm font-semibold uppercase tracking-wider text-custom-500 dark:text-custom-400'

const fieldLabelClass = 'text-sm font-medium text-custom-700 dark:text-custom-200'

const helperTextClass = 'text-xs text-custom-500 dark:text-custom-500'

const primaryButtonClass =
  'flex items-center gap-1.5 rounded-lg bg-custom-800 px-3 py-2 text-sm text-custom-50 transition-colors hover:bg-custom-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-custom-50 dark:text-custom-800 dark:hover:bg-custom-200'

const secondaryButtonClass =
  'flex items-center gap-1.5 rounded-lg border border-custom-200 bg-custom-50 px-3 py-2 text-sm text-custom-700 transition-colors hover:bg-custom-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-custom-700 dark:bg-custom-800/30 dark:text-custom-200 dark:hover:bg-custom-700/50'

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

export default function UpdatesSection() {
  const status = useUpdaterStore((s) => s.status)
  const check = useUpdaterStore((s) => s.check)
  const download = useUpdaterStore((s) => s.download)
  const install = useUpdaterStore((s) => s.install)

  const phase = status?.phase ?? 'idle'
  const isChecking = phase === 'checking'
  const isDownloading = phase === 'downloading'

  return (
    <section className="mt-8">
      <h2 className={sectionTitleClass}>Updates</h2>
      <div className={sectionCardClass}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <label className={fieldLabelClass}>App Version</label>
            <p className={`${helperTextClass} mt-0.5`}>
              Current version:{' '}
              <span className="text-custom-700 dark:text-custom-300">
                v{status?.currentVersion ?? '—'}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => check()}
            disabled={isChecking || isDownloading}
            className={secondaryButtonClass}
          >
            <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
            {isChecking ? 'Checking…' : 'Check for updates'}
          </button>
        </div>

        {phase === 'not-available' && (
          <div className="mt-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 size={14} />
            You&apos;re on the latest version.
          </div>
        )}

        {phase === 'available' && status && (
          <div className="mt-4 rounded-lg border border-custom-200 bg-custom-50 p-3 dark:border-custom-700 dark:bg-custom-800/30">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={fieldLabelClass}>Update available — v{status.availableVersion}</p>
                {status.releaseDate && (
                  <p className={`${helperTextClass} mt-0.5`}>
                    Released {new Date(status.releaseDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => download()} className={primaryButtonClass}>
                <Download size={14} /> Download
              </button>
            </div>
            {status.releaseNotes && (
              <div
                className={`${helperTextClass} mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap [&_a]:text-custom-700 dark:[&_a]:text-custom-300`}
                dangerouslySetInnerHTML={{ __html: status.releaseNotes }}
              />
            )}
          </div>
        )}

        {phase === 'downloading' && status && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-custom-600 dark:text-custom-300">
              <span>Downloading v{status.availableVersion}…</span>
              <span>
                {formatBytes(status.transferred)} / {formatBytes(status.total)}
                {status.bytesPerSecond > 0 && ` · ${formatBytes(status.bytesPerSecond)}/s`}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-custom-200 dark:bg-custom-700">
              <div
                className="h-full bg-custom-800 transition-all dark:bg-custom-50"
                style={{ width: `${status.downloadPercent}%` }}
              />
            </div>
          </div>
        )}

        {phase === 'downloaded' && status && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-3">
            <div>
              <p className={fieldLabelClass}>v{status.availableVersion} ready to install</p>
              <p className={`${helperTextClass} mt-0.5`}>
                The app will restart to complete the update.
              </p>
            </div>
            <button type="button" onClick={() => install()} className={primaryButtonClass}>
              <RotateCw size={14} /> Restart & install
            </button>
          </div>
        )}

        {phase === 'error' && status?.error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-400">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span className="break-words">{status.error}</span>
          </div>
        )}
      </div>
    </section>
  )
}
