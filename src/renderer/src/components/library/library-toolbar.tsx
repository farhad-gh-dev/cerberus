import { memo } from 'react'
import { ArrowUpDown, Filter, Trash2, Tag } from 'lucide-react'
import Dropdown, { type Choice } from '../ui/dropdown'
import MultiDropdown from '../ui/multi-dropdown'

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
    <div className="flex flex-col gap-3 mt-6">
      {/* Row: sort + status + count */}
      <div className="flex items-center gap-3 flex-wrap">
        <Dropdown
          value={sort}
          choices={SORT_CHOICES}
          onChange={onSortChange}
          icon={<ArrowUpDown size={14} className="text-custom-400" />}
        />

        <Dropdown
          value={statusFilter}
          choices={STATUS_CHOICES}
          onChange={onStatusFilterChange}
          icon={<Filter size={14} className="text-custom-400" />}
        />

        {genres.length > 0 && (
          <MultiDropdown
            label="Genre"
            options={genres}
            selected={activeGenres}
            onToggle={onGenreToggle}
            icon={<Tag size={14} className="text-custom-400" />}
          />
        )}

        {hasActiveFilters && (
          <button
            onClick={onClearAllFilters}
            className="flex items-center gap-2 text-sm xl:text-base text-custom-500 hover:text-custom-700 dark:text-custom-400 dark:hover:text-custom-200 transition-colors ml-1"
          >
            <Trash2 size={18} />
            Clear all
          </button>
        )}

        {resultCount !== totalCount && (
          <span className="text-xs text-custom-500 ml-auto">
            Showing {resultCount} of {totalCount}
          </span>
        )}
      </div>
    </div>
  )
})
