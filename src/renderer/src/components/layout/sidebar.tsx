import { NavLink } from 'react-router-dom'
import { Home, Library, Download, Settings, Globe, BarChart3, Sun, Moon } from 'lucide-react'
import icon from '../../../../../resources/icon.png'
import { useThemeStore } from '../../stores/theme'
import { useDownloadsStore } from '../../stores/downloads'
import { useUpdaterStore, isUpdateAvailable } from '../../stores/updater'

const mainNavItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/downloads', icon: Download, label: 'Downloads' },
  // Dev-only preview pages
  ...(import.meta.env.DEV
    ? [
        { to: '/map-preview', icon: Globe, label: 'Globe Preview' },
        { to: '/chart-preview', icon: BarChart3, label: 'Chart Preview' }
      ]
    : [])
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
    isActive
      ? 'bg-custom-300 text-custom-800 dark:bg-custom-600 dark:text-custom-50'
      : 'text-custom-400 hover:text-custom-700 hover:bg-custom-200 dark:text-custom-400 dark:hover:text-custom-100 dark:hover:bg-custom-700'
  }`

export default function Sidebar() {
  const { theme, toggle } = useThemeStore()
  const isDark = theme === 'dark'
  // Select a scalar so the sidebar re-renders only when the progress number changes.
  const downloadProgress = useDownloadsStore((s) => {
    for (const id of s.ids) {
      const d = s.byId[id]
      if (d.status === 'downloading') return Math.round(d.progress * 100)
    }
    return -1
  })
  const hasActiveDownload = downloadProgress >= 0
  const updaterStatus = useUpdaterStore((s) => s.status)
  const updateAvailable = isUpdateAvailable(updaterStatus)

  return (
    <aside className="w-16 m-3 mr-0 rounded-2xl flex flex-col items-center py-6 bg-custom-50 dark:bg-custom-800">
      {/* App logo / brand mark */}
      <img src={icon} alt="Cerberus" className="w-8 h-8 rounded-lg mb-10" />

      {/* Nav icons */}
      <nav className="flex flex-col gap-4 flex-1">
        {mainNavItems.map(({ to, icon: Icon, label }) =>
          to === '/downloads' ? (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={navLinkClass}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              {({ isActive }) => (
                <>
                  {hasActiveDownload && !isActive && (
                    <span
                      className="absolute inset-y-0 left-0 rounded-xl bg-emerald-500/30 transition-all duration-500 ease-out"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  )}
                  <Icon size={20} className="relative z-10" />
                </>
              )}
            </NavLink>
          ) : (
            <NavLink key={to} to={to} title={label} className={navLinkClass}>
              <Icon size={20} />
            </NavLink>
          )
        )}
      </nav>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        className="w-12 h-12 flex items-center justify-center rounded-xl transition-colors mb-2 text-custom-400 hover:text-custom-700 hover:bg-custom-200 dark:text-custom-400 dark:hover:text-custom-100 dark:hover:bg-custom-700"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Settings at bottom */}
      <NavLink
        to="/settings"
        title={updateAvailable ? 'Settings — update available' : 'Settings'}
        className={navLinkClass}
        style={{ position: 'relative' }}
      >
        <Settings size={20} />
        {updateAvailable && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-custom-50 dark:ring-custom-800" />
        )}
      </NavLink>
    </aside>
  )
}
