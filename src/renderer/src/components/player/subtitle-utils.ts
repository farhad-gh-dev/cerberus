/** Preset vertical offsets from the bottom of the video (in %). */
export const SUBTITLE_POSITIONS = [
  { label: 'Bottom', value: 3 },
  { label: 'Low', value: 6 },
  { label: 'Mid-low', value: 12 },
  { label: 'Middle', value: 20 },
  { label: 'High', value: 28 }
]

/** Preset font sizes for subtitles (in px). */
export const SUBTITLE_FONT_SIZES = [
  { label: 'Small', value: '28px' },
  { label: 'Medium', value: '36px' },
  { label: 'Large', value: '44px' },
  { label: 'X-Large', value: '52px' }
]

/** Default position — "Low", comfortably above the bottom edge. */
export const DEFAULT_POSITION = SUBTITLE_POSITIONS[1].value

/** Default font size — "Medium". */
export const DEFAULT_FONT_SIZE = SUBTITLE_FONT_SIZES[1].value

/**
 * Step forward or backward through a preset array.
 * Returns the next/previous value, or the current value if already at a boundary.
 */
export function stepPreset<T extends string | number>(
  presets: readonly { value: T }[],
  current: T,
  direction: 1 | -1
): T {
  const idx = presets.findIndex((p) => p.value === current)
  const next = idx + direction
  if (idx === -1 || next < 0 || next >= presets.length) return current
  return presets[next].value
}

/**
 * Strip the Electron IPC prefix from error messages so they're user-friendly.
 * e.g. `Error invoking remote method 'x': Error: actual message` → `actual message`
 */
export function stripIpcError(err: unknown): string {
  const msg = err instanceof Error ? err.message : 'Unknown error'
  return msg.replace(/^Error invoking remote method '[^']+': (Error: )?/i, '')
}
