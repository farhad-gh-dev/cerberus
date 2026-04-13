import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../utils/cn'

export interface Choice<T extends string> {
  value: T
  label: string
}

export default function Dropdown<T extends string>({
  value,
  choices,
  onChange,
  icon
}: {
  value: T
  choices: Choice<T>[]
  onChange: (v: T) => void
  icon: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }, [])

  const active = choices.find((c) => c.value === value)

  return (
    <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 bg-zinc-800/60 border border-zinc-700 hover:border-zinc-600 text-sm text-zinc-300 rounded-lg px-3 py-1.5 transition-colors"
      >
        {icon}
        <span>{active?.label}</span>
        <ChevronDown
          size={14}
          className={cn('text-zinc-500 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 z-50 min-w-[170px]"
        >
          {choices.map((c) => (
            <button
              key={c.value}
              role="option"
              aria-selected={c.value === value}
              onClick={() => {
                onChange(c.value)
                setOpen(false)
              }}
              className={cn(
                'w-full text-left text-sm px-3 py-1.5 transition-colors',
                c.value === value
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
