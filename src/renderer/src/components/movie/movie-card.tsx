import { Film, CheckCircle2, BookmarkCheck } from 'lucide-react'
import { isValidField } from '../../utils/formatters'

export type MovieCardStatus = 'none' | 'in-library' | 'downloaded'

interface MovieCardProps {
  title: string
  year: string
  posterUrl: string
  rating?: string
  status?: MovieCardStatus
  hideStatusBadge?: boolean
  onClick?: () => void
}

export default function MovieCard({
  title,
  year,
  posterUrl,
  rating,
  status = 'none',
  hideStatusBadge = false,
  onClick
}: MovieCardProps) {
  const hasPoster = isValidField(posterUrl)

  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all hover:scale-[1.02] cursor-pointer"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-800 flex items-center justify-center">
        {hasPoster ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Film size={40} className="text-zinc-600" />
        )}

        {/* Library / Downloaded indicator badge */}
        {!hideStatusBadge && status === 'downloaded' && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg">
            <CheckCircle2 size={12} />
            Downloaded
          </div>
        )}
        {!hideStatusBadge && status === 'in-library' && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg">
            <BookmarkCheck size={12} />
            In Library
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-white truncate">{title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-zinc-500">{year}</span>
          {isValidField(rating) && <span className="text-xs text-yellow-400">★ {rating}</span>}
        </div>
      </div>
    </button>
  )
}
