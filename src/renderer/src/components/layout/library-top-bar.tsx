import { Plus } from 'lucide-react'
import Heading from '../ui/heading'
import SearchBar from '../ui/search-bar'

interface LibraryTopBarProps {
  movieCount: number
  search: string
  onSearchChange: (value: string) => void
  onAddFromDevice: () => void
}

export default function LibraryTopBar({
  movieCount,
  search,
  onSearchChange,
  onAddFromDevice
}: LibraryTopBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left — Page title + count */}
      <div className="flex items-baseline gap-3 shrink-0">
        <Heading level={1} className="!font-semibold">
          My Library
        </Heading>
        <span className="text-custom-500 dark:text-custom-400 text-sm">
          {movieCount} {movieCount === 1 ? 'movie' : 'movies'}
        </span>
      </div>

      {/* Right — Search bar + Add button */}
      <div className="flex items-center gap-3">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          onReset={() => onSearchChange('')}
          placeholder="Search library..."
          className="w-64 xl:w-72"
        />
        <button
          onClick={onAddFromDevice}
          className="flex items-center gap-2 bg-custom-800 hover:bg-custom-700 text-custom-50 dark:bg-custom-50 dark:hover:bg-custom-200 dark:text-custom-800 text-sm xl:text-base font-medium px-4 py-2.5 xl:py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Plus size={16} />
          Add From Your Device
        </button>
      </div>
    </div>
  )
}
