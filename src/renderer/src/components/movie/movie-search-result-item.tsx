import { memo } from 'react'
import { Film } from 'lucide-react'
import type { MovieSearchItem } from '@shared/types'
import { isValidField } from '../../utils/formatters'
import { cn } from '../../utils/cn'

export interface MovieSearchResultItemProps {
  item: MovieSearchItem
  onSelect: (item: MovieSearchItem) => void
  variant?: 'card' | 'dropdown'
}

const MovieSearchResultItem = memo(
  ({ item, onSelect, variant = 'card' }: MovieSearchResultItemProps) => {
    const isDropdown = variant === 'dropdown'

    return (
      <button
        onClick={() => onSelect(item)}
        className={cn(
          'w-full flex items-center transition-colors text-left',
          isDropdown
            ? 'gap-2.5 rounded-lg px-1.5 py-1 text-sm text-custom-600 hover:bg-custom-200 hover:text-custom-800 dark:text-custom-300 dark:hover:bg-custom-700 dark:hover:text-custom-50'
            : 'gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60'
        )}
      >
        {isValidField(item.posterUrl) ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className={cn(
              'object-cover shrink-0',
              isDropdown ? 'w-11 h-15 rounded-lg' : 'w-10 h-14 rounded-lg'
            )}
          />
        ) : (
          <div
            className={cn(
              'flex items-center justify-center shrink-0 bg-zinc-200 dark:bg-zinc-800',
              isDropdown ? 'w-11 h-15 rounded-lg' : 'w-10 h-14 rounded-lg'
            )}
          >
            <Film size={16} className="text-zinc-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'truncate font-medium',
              isDropdown
                ? 'text-custom-800 dark:text-custom-100'
                : 'text-sm text-zinc-900 dark:text-white'
            )}
          >
            {item.title}
          </p>
          <p
            className={cn(
              'text-xs',
              isDropdown
                ? 'mt-0.5 text-custom-500 dark:text-custom-400'
                : 'text-zinc-500 dark:text-zinc-500'
            )}
          >
            {item.year}
          </p>
        </div>
      </button>
    )
  }
)

export default MovieSearchResultItem
