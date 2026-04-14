import { NavLink } from 'react-router-dom'
import { Home, Library, Download, Settings, Globe, BarChart3 } from 'lucide-react'
import icon from '../../../../../resources/icon.png'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/downloads', icon: Download, label: 'Downloads' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  // Dev-only preview pages
  ...(import.meta.env.DEV
    ? [
        { to: '/map-preview', icon: Globe, label: 'Globe Preview' },
        { to: '/chart-preview', icon: BarChart3, label: 'Chart Preview' }
      ]
    : [])
]

export default function Sidebar() {
  return (
    <aside className="w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-6">
      {/* App logo / brand mark */}
      <img src={icon} alt="Cerberus" className="w-8 h-8 rounded-lg" />

      {/* Nav icons */}
      <nav className="flex flex-col gap-4 flex-1 justify-center">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`
            }
          >
            <Icon size={20} />
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
