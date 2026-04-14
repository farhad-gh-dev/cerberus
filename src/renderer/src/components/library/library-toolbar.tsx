import { memo } from 'react'
import { ArrowUpDown, Filter, X } from 'lucide-react'
import Dropdown, { type Choice } from '../ui/dropdown'
import { cn } from '../../utils/cn'

// ── Sort ──

export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'rating-desc'
  | 'rating-asc'
  | 'year-desc'
  | 'year-asc'
  | 'added-desc'
  | 'added-asc'

const SORT_CHOICES: Choice<SortOption>[] = [
  { value: 'added-desc', label: 'Recently Added' },
  { value: 'added-asc', label: 'Oldest Added' },
  { value: 'title-asc', label: 'Title A → Z' },
  { value: 'title-desc', label: 'Title Z → A' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'rating-asc', label: 'Lowest Rated' },
  { value: 'year-desc', label: 'Newest' },
  { value: 'year-asc', label: 'Oldest' }
]

// ── Status filter ──

export type StatusFilter = 'all' | 'downloaded' | 'not-downloaded'

const STATUS_CHOICES: Choice<StatusFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'downloaded', label: 'Downloaded' },
  { value: 'not-downloaded', label: 'Not Downloaded' }
]

// ── Props ──

interface LibraryToolbarProps {
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (status: StatusFilter) => void
  genres: string[]
  activeGenres: string[]
  onGenreToggle: (genre: string) => void
  onClearAllFilters: () => void
  resultCount: number
  totalCount: number
}

// ── Main component ──

export default memo(function LibraryToolbar({
  sort,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  genres,
  activeGenres,
  onGenreToggle,
  onClearAllFilters,
  resultCount,
  totalCount
}: LibraryToolbarProps) {
  const hasActiveFilters = activeGenres.length > 0 || statusFilter !== 'all'

  return (
    <div className="flex flex-col gap-3 mt-5">
      {/* Row: sort + status + count */}
      <div className="flex items-center gap-2 flex-wrap">
        <Dropdown
          value={sort}
          choices={SORT_CHOICES}
          onChange={onSortChange}
          icon={<ArrowUpDown size={14} className="text-zinc-400" />}
        />

        <Dropdown
          value={statusFilter}
          choices={STATUS_CHOICES}
          onChange={onStatusFilterChange}
          icon={<Filter size={14} className="text-zinc-400" />}
        />

        {hasActiveFilters && (
          <button
            onClick={onClearAllFilters}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
          >
            <X size={12} />
            Clear filters
          </button>
        )}

        {resultCount !== totalCount && (
          <span className="text-xs text-zinc-500 ml-auto">
            Showing {resultCount} of {totalCount}
          </span>
        )}
      </div>

      {/* Genre chips */}
      {genres.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {genres.map((genre) => {
            const isActive = activeGenres.includes(genre)
            return (
              <button
                key={genre}
                onClick={() => onGenreToggle(genre)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                  isActive
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:border-zinc-600 hover:text-zinc-300'
                )}
              >
                {genre}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})
