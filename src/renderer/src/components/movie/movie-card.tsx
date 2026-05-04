import { Film, Globe, Calendar, Clock, BookmarkCheck, HardDriveDownload } from 'lucide-react'
import { isValidField, formatLanguage } from '../../utils/formatters'
import Heading from '../ui/heading'
import Text from '../ui/text'

interface MovieCardProps {
  title: string
  year: string
  posterUrl: string
  rating?: string
  genres?: string[]
  language?: string
  runtime?: string
  isInLibrary?: boolean
  isDownloaded?: boolean
  onClick?: () => void
}

export default function MovieCard({
  title,
  year,
  posterUrl,
  rating,
  genres,
  language,
  runtime,
  isInLibrary = false,
  isDownloaded = false,
  onClick
}: MovieCardProps) {
  const hasPoster = isValidField(posterUrl)
  const displayGenres = genres?.slice(0, 2) ?? []

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`group text-left rounded-2xl overflow-hidden bg-custom-100 dark:bg-custom-800 relative flex flex-col ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-custom-200 dark:bg-custom-700 flex items-center justify-center">
        {hasPoster ? (
          <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <Film size={48} className="text-custom-400 dark:text-custom-600" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Status badges — top right */}
        {(isInLibrary || isDownloaded) && (
          <div className="absolute top-3 right-3 z-10 flex gap-1.5">
            {isInLibrary && (
              <div title="In library" className="bg-black/30 backdrop-blur-sm p-1.5 rounded-full">
                <BookmarkCheck size={16} className="text-white" />
              </div>
            )}
            {isDownloaded && (
              <div title="Downloaded" className="bg-black/30 backdrop-blur-sm p-1.5 rounded-full">
                <HardDriveDownload size={16} className="text-white" />
              </div>
            )}
          </div>
        )}

        {/* Genre badges — top left */}
        {displayGenres.length > 0 && (
          <div className="absolute top-3 left-3 flex gap-1.5">
            {displayGenres.map((genre) => (
              <span
                key={genre}
                className="text-[11px] xl:text-xs font-medium text-white bg-black/30 backdrop-blur-sm px-2.5 pt-1 pb-1.5 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          {/* Title + Rating */}
          <div className="flex items-end justify-between gap-2">
            <Heading
              level={4}
              className="text-base xl:text-lg !text-white leading-tight truncate min-w-0 flex-1"
            >
              {title}
            </Heading>
            {isValidField(rating) && (
              <Text as="span" className="text-base xl:text-lg font-bold !text-white shrink-0">
                ★ {rating}
              </Text>
            )}
          </div>

          <div className="w-full h-px bg-white/20 mt-4" />

          {/* Metadata row */}
          <div className="flex items-center divide-x divide-white/20 mt-4">
            {isValidField(language) && (
              <Text
                as="span"
                size="sm"
                className="flex-1 flex items-center justify-start gap-1 text-xs xl:text-sm !text-white/70"
              >
                <Globe size={14} className="xl:size-3.5" />
                {formatLanguage(language)}
              </Text>
            )}
            {isValidField(year) && (
              <Text
                as="span"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1 text-xs xl:text-sm !text-white/70"
              >
                <Calendar size={14} className="xl:size-3.5" />
                {year}
              </Text>
            )}
            {isValidField(runtime) && (
              <Text
                as="span"
                size="sm"
                className="flex-1 flex items-center justify-end gap-1 text-xs xl:text-sm !text-white/70"
              >
                <Clock size={14} className="xl:size-3.5" />
                {runtime}
              </Text>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
