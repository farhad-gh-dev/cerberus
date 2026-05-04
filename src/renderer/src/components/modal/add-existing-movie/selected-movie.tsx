import { Film, Pencil, Star } from 'lucide-react'
import type { MovieSearchItem } from '@shared/types'
import { isValidField } from '../../../utils/formatters'
import Text from '../../ui/text'

interface SelectedMovieProps {
  movie: MovieSearchItem
  onChange: () => void
}

export default function SelectedMovie({ movie, onChange }: SelectedMovieProps) {
  const metadata = [movie.year, movie.rating ? `${movie.rating}/10` : '']
    .filter(Boolean)
    .join(' • ')
  const details = movie.genres.filter(Boolean).slice(0, 2).join(' • ')

  return (
    <div className="flex gap-4 rounded-2xl bg-custom-100 p-2 shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:bg-custom-800 dark:shadow-[0_12px_32px_rgba(0,0,0,0.24)]">
      <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-custom-200 dark:bg-custom-900">
        {isValidField(movie.posterUrl) ? (
          <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
        ) : (
          <Film size={24} className="text-custom-400 dark:text-custom-500" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-1 pr-1">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight text-custom-800 dark:text-custom-50">
            {movie.title}
          </h3>

          {metadata && (
            <div className="mt-2 flex items-center gap-2 text-xs text-custom-600 dark:text-custom-300">
              {movie.rating && (
                <Star
                  size={12}
                  className="shrink-0 fill-current text-custom-500 dark:text-custom-300"
                />
              )}
              <Text as="span" size="xs" className="truncate text-custom-600 dark:text-custom-300">
                {metadata}
              </Text>
            </div>
          )}

          {details && (
            <Text as="p" size="sm" className="mt-2 truncate text-zinc-500 dark:text-zinc-400">
              {details}
            </Text>
          )}
        </div>

        <div className="mt-0 flex justify-end">
          <button
            onClick={onChange}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-custom-500 transition-colors hover:text-custom-800 dark:text-custom-400 dark:hover:text-custom-50"
          >
            <Pencil size={12} className="shrink-0" />
            Change
          </button>
        </div>
      </div>
    </div>
  )
}
