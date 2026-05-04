import { useEffect, useRef } from 'react'
import {
  AlertTriangle,
  Check,
  Film,
  Loader2,
  Pencil,
  Trash2,
  XCircle
} from 'lucide-react'
import type { ImportRow } from '../../../hooks/use-batch-import'
import type { MovieSearchItem } from '@shared/types'
import { isValidField } from '../../../utils/formatters'
import { cn } from '../../../utils/cn'
import MovieSearchResultItem from '../../movie/movie-search-result-item'
import SearchBar from '../../ui/search-bar'
import Text from '../../ui/text'

interface ImportRowProps {
  row: ImportRow
  onSetEditing: (rowId: string, editing: boolean) => void
  onSetQuery: (rowId: string, value: string) => void
  onSelectMovie: (rowId: string, item: MovieSearchItem) => void
  onRemove: (rowId: string) => void
}

function StatusBadge({ status }: { status: ImportRow['status'] }) {
  const map: Record<ImportRow['status'], { label: string; icon: React.ReactNode; cls: string }> = {
    matching: {
      label: 'Matching…',
      icon: <Loader2 size={11} className="animate-spin" />,
      cls: 'bg-custom-200 text-custom-700 dark:bg-custom-700 dark:text-custom-200'
    },
    matched: {
      label: 'Matched',
      icon: <Check size={11} />,
      cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    },
    unmatched: {
      label: 'No match',
      icon: <AlertTriangle size={11} />,
      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    },
    adding: {
      label: 'Adding…',
      icon: <Loader2 size={11} className="animate-spin" />,
      cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    },
    added: {
      label: 'Added',
      icon: <Check size={11} />,
      cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    },
    error: {
      label: 'Failed',
      icon: <XCircle size={11} />,
      cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    }
  }
  const { label, icon, cls } = map[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
        cls
      )}
    >
      {icon}
      {label}
    </span>
  )
}

export default function ImportRowItem({
  row,
  onSetEditing,
  onSetQuery,
  onSelectMovie,
  onRemove
}: ImportRowProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (row.editing) searchInputRef.current?.focus()
  }, [row.editing])

  const isCommitted = row.status === 'added' || row.status === 'adding'
  const matchedMovie = row.selectedMovie

  return (
    <div
      className={cn(
        'rounded-xl border bg-custom-50 p-3 transition-colors dark:bg-custom-800/30',
        row.status === 'error'
          ? 'border-red-300 dark:border-red-800/60'
          : 'border-custom-200 dark:border-custom-700'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Poster */}
        <div className="h-[72px] w-12 shrink-0 overflow-hidden rounded-md bg-custom-200 dark:bg-custom-900">
          {matchedMovie && isValidField(matchedMovie.posterUrl) ? (
            <img
              src={matchedMovie.posterUrl}
              alt={matchedMovie.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Film size={18} className="text-custom-400 dark:text-custom-500" />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Text
              size="xs"
              className="truncate font-mono text-custom-500 dark:text-custom-400"
              title={row.fileName}
            >
              {row.fileName}
            </Text>
            <StatusBadge status={row.status} />
          </div>

          {matchedMovie ? (
            <Text size="sm" className="truncate font-medium text-custom-800 dark:text-custom-50">
              {matchedMovie.title}
              {matchedMovie.year && (
                <span className="ml-1.5 text-custom-500 dark:text-custom-400">
                  ({matchedMovie.year})
                </span>
              )}
            </Text>
          ) : (
            <Text size="sm" className="italic text-custom-500 dark:text-custom-400">
              {row.searchError ?? 'No movie selected'}
            </Text>
          )}

          {row.errorMsg && (
            <Text size="xs" className="text-red-600 dark:text-red-400">
              {row.errorMsg}
            </Text>
          )}
        </div>

        {/* Actions */}
        {!isCommitted && (
          <div className="flex shrink-0 items-center gap-1">
            {row.status !== 'matching' && (
              <button
                onClick={() => onSetEditing(row.id, !row.editing)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-custom-500 transition-colors hover:bg-custom-200 hover:text-custom-800 dark:text-custom-400 dark:hover:bg-custom-700 dark:hover:text-custom-50"
                title={row.editing ? 'Cancel edit' : 'Change match'}
              >
                <Pencil size={14} />
              </button>
            )}
            <button
              onClick={() => onRemove(row.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-custom-500 transition-colors hover:bg-custom-200 hover:text-red-500 dark:text-custom-400 dark:hover:bg-custom-700 dark:hover:text-red-400"
              title="Remove from batch"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Inline search — only when the user explicitly opens it */}
      {!isCommitted && row.editing && (
        <div className="relative mt-3">
          <SearchBar
            inputRef={searchInputRef}
            value={row.query}
            onChange={(v) => onSetQuery(row.id, v)}
            onReset={() => onSetQuery(row.id, '')}
            placeholder="Search by movie title..."
            isLoading={row.searching}
            className="w-full xl:w-full"
          />

          {row.query.trim() && (row.searching || row.results.length > 0 || row.searchError) && (
            <div className="absolute z-50 left-0 right-0 mt-1.5 min-w-[230px] overflow-hidden rounded-xl bg-custom-50 p-1.5 shadow-lg dark:bg-custom-800 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_10px_rgba(0,0,0,0.2)]">
              {row.searchError && !row.searching && (
                <p className="px-3 py-4 text-center text-sm text-custom-500 dark:text-custom-400">
                  {row.searchError}
                </p>
              )}

              {!row.searching && row.results.length > 0 && (
                <div className="max-h-[40vh] overflow-y-auto space-y-1">
                  {row.results.map((item) => (
                    <MovieSearchResultItem
                      key={item.id}
                      item={item}
                      onSelect={(m) => onSelectMovie(row.id, m)}
                      variant="dropdown"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
