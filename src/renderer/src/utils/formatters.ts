/** Check if a field has a real value (not missing or empty) */
export function isValidField(value: string | undefined | null): value is string {
  return !!value && value !== 'N/A'
}

/** Split a comma-separated field (e.g. Genre, Actors) into an array, returns [] if empty */
export function parseList(value: string | undefined | null): string[] {
  return isValidField(value) ? value.split(', ') : []
}

/** Resolve the best hero/background image: prefer backdrop, fall back to poster, return null if none */
export function getHeroImage(
  backdrop: string | null,
  poster: string | undefined | null,
  backdropLoading: boolean
): string | null {
  if (backdropLoading) return null
  return backdrop || (isValidField(poster) ? poster : null)
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function formatSpeed(bytesPerSec: number): string {
  return `${formatBytes(bytesPerSec)}/s`
}

export function formatEta(ms: number): string {
  if (!isFinite(ms) || ms <= 0) return '--'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })

export function formatLanguage(code: string): string {
  try {
    return languageNames.of(code) ?? code
  } catch {
    return code
  }
}
