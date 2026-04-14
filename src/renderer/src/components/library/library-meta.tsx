import { Star, Clock } from 'lucide-react'
import type { LibraryMovie } from '@shared/types'
import { isValidField } from '../../utils/formatters'

export default function LibraryMeta({ movie }: { movie: LibraryMovie }) {
  return (
    <>
      {isValidField(movie.imdbRating) && (
        <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
          <Star size={16} fill="currentColor" />
          {movie.imdbRating}
        </span>
      )}
      {isValidField(movie.runtime) && (
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {movie.runtime}
        </span>
      )}
      {isValidField(movie.year) && <span>{movie.year}</span>}
    </>
  )
}
