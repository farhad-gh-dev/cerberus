import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onReset?: () => void
  placeholder?: string
}

export default function SearchBar({
  onSearch,
  onReset,
  placeholder = 'Search movies...'
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleReset = () => {
    setQuery('')
    if (onReset) {
      onReset()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-72">
      {query ? (
        <button
          type="button"
          onClick={handleReset}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X size={16} />
        </button>
      ) : (
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
      )}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent border border-zinc-700 text-white text-sm rounded-xl pl-4 pr-9 py-2 w-72 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:shadow-[0_0_8px_rgba(255,255,255,0.15)] transition-all"
      />
    </form>
  )
}
