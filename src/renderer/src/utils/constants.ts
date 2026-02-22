// Tailwind z-index classes used across the app.
// Reference these in comments next to z-* classes to keep them in sync.
//
//   z-10  — content overlays (hero text, close buttons inside pages)
//   z-50  — modals, window title bar, movie detail overlay
//   z-[60] — stacked modals (torrent results on top of movie detail)
//   z-[100] — toast notifications (always on top)

// Timeouts (ms)
export const TOAST_DURATION = 4000
export const SAVED_FEEDBACK_DURATION = 2000
export const CONTROLS_HIDE_DELAY = 3000

// Player
export const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
export const VOLUME_STEP = 0.05
export const FRAME_DURATION = 1 / 30
