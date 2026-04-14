import { memo } from 'react'
import { Film, Plus } from 'lucide-react'
import type { MovieSearchItem } from '@shared/types'
import { isValidField } from '../../utils/formatters'

export interface MovieSearchResultItemProps {
  item: MovieSearchItem
  isAdding: boolean
  disabled: boolean
  onAdd: (item: MovieSearchItem) => void
}

/**
 * Individual search result row, memoized so only the row whose
 * `isAdding` / `disabled` props change will re-render.
 */
const MovieSearchResultItem = memo(
  ({ item, isAdding, disabled, onAdd }: MovieSearchResultItemProps) => {
    return (
      <button
        onClick={() => onAdd(item)}
        disabled={disabled}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800/60 transition-colors text-left disabled:opacity-50"
      >
        {isValidField(item.posterUrl) ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-10 h-14 object-cover rounded-lg shrink-0"
          />
        ) : (
          <div className="w-10 h-14 bg-zinc-700 rounded-lg flex items-center justify-center shrink-0">
            <Film size={16} className="text-zinc-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{item.title}</p>
          <p className="text-xs text-zinc-500">{item.year}</p>
        </div>
        {isAdding ? (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-blue-500/20 flex items-center justify-center shrink-0 text-zinc-400 hover:text-blue-400 transition-colors">
            <Plus size={16} />
          </div>
        )}
      </button>
    )
  }
)

export default MovieSearchResultItem
