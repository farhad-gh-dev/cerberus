import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  toggle: () => void
}

const hasDom = typeof document !== 'undefined'

function readInitialTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'dark'
  return (localStorage.getItem('theme') as Theme) || 'dark'
}

function syncThemeClass(theme: Theme): void {
  if (!hasDom) return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

const initial = readInitialTheme()
syncThemeClass(initial)

const useThemeStore = create<ThemeState>((set) => ({
  theme: initial,
  toggle: () =>
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark'
      if (typeof localStorage !== 'undefined') localStorage.setItem('theme', next)
      syncThemeClass(next)
      return { theme: next }
    })
}))

export { useThemeStore }
