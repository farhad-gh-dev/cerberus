import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../utils/cn'

interface SearchBarProps {
  onSearch?: (query: string) => void
  value?: string
  onChange?: (value: string) => void
  onReset?: () => void
  placeholder?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
  isLoading?: boolean
  className?: string
}

export default function SearchBar({
  onSearch,
  value,
  onChange,
  onReset,
  placeholder = 'Search movies...',
  inputRef,
  isLoading = false,
  className
}: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState('')
  const query = value ?? internalQuery
  const isControlled = value !== undefined

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleChange = (nextValue: string) => {
    if (!isControlled) {
      setInternalQuery(nextValue)
    }
    onChange?.(nextValue)
  }

  const handleReset = () => {
    if (!isControlled) {
      setInternalQuery('')
    }
    onChange?.('')
    onReset?.()
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-72 xl:w-80', className)}>
      <Search
        size={20}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-500 dark:text-custom-400"
      />
      {isLoading ? (
        <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-custom-500 border-t-transparent animate-spin" />
      ) : query ? (
        <button
          type="button"
          onClick={handleReset}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-500 hover:text-custom-700 dark:text-custom-400 dark:hover:text-custom-100 transition-colors"
        >
          <X size={16} />
        </button>
      ) : null}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="bg-custom-50 border-none text-custom-800 dark:bg-custom-800 dark:text-custom-50 text-sm xl:text-base rounded-xl pl-10 pr-9 py-2.5 xl:py-2.5 w-full placeholder-custom-400 dark:placeholder-custom-400 focus:outline-none shadow-[0_0_4px_rgba(0,0,0,0.08)] transition-all"
      />
    </form>
  )
}
