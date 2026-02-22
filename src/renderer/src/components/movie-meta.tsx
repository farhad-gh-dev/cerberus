import { Star, Clock } from 'lucide-react'
import type { MovieDetail } from '@shared/types'
import { isValidField } from '../utils/formatters'

interface MovieMetaProps {
  movie: MovieDetail
}

export default function MovieMeta({ movie }: MovieMetaProps) {
  return (
    <>
      {isValidField(movie.rating) && (
        <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
          <Star size={16} fill="currentColor" />
          {movie.rating}
          {isValidField(movie.votes) && (
            <span className="text-white/40 font-normal ml-0.5">| {movie.votes}</span>
          )}
        </span>
      )}
      {isValidField(movie.runtime) && (
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {movie.runtime}
        </span>
      )}
      {isValidField(movie.year) && <span>{movie.year}</span>}
      {isValidField(movie.rated) && (
        <span className="px-2 py-0.5 border border-white/30 rounded text-xs">{movie.rated}</span>
      )}
    </>
  )
}
