import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface Choice<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
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
  icon?: React.ReactNode
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
        className={cn(
          'flex items-center gap-1.5 rounded-xl px-4.5 py-2 text-sm xl:text-base xl:px-5 xl:py-2.5 font-medium transition-colors',
          'bg-custom-50 shadow-sm text-custom-700 hover:bg-custom-100',
          'dark:bg-custom-800 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_6px_rgba(0,0,0,0.2)] dark:text-custom-200 dark:hover:bg-custom-700'
        )}
      >
        {icon}
        <span>{active?.label}</span>
        <ChevronDown
          size={14}
          className={cn(
            'text-custom-400 dark:text-custom-500 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute top-full left-0 mt-1.5 rounded-xl shadow-lg p-1.5 xl:p-2 z-50 min-w-[200px] xl:min-w-[230px] flex flex-col gap-1',
            'bg-custom-50',
            'dark:bg-custom-800 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_10px_rgba(0,0,0,0.2)]'
          )}
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
                'w-full text-left text-sm xl:text-base px-3 py-2 xl:px-3.5 xl:py-2.5 rounded-lg transition-colors flex items-center gap-2.5',
                c.value === value
                  ? 'bg-custom-200 text-custom-800 dark:bg-custom-700 dark:text-custom-50'
                  : 'text-custom-600 hover:bg-custom-100 dark:text-custom-400 dark:hover:bg-custom-700/60'
              )}
            >
              {c.icon && <span className="text-custom-400 dark:text-custom-500">{c.icon}</span>}
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
