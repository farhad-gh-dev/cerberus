import type { MovieDetail } from '@shared/types'
import { isValidField } from '../../utils/formatters'

interface MovieSidePanelProps {
  movie: MovieDetail
  cast: string[]
  directors: string[]
  writers: string[]
}

function SectionHeader({ children }: { children: string }) {
  return (
    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">
      {children}
    </h3>
  )
}

export default function MovieSidePanel({ movie, cast, directors, writers }: MovieSidePanelProps) {
  return (
    <>
      {cast.length > 0 && (
        <div className="mb-8">
          <SectionHeader>Actors</SectionHeader>
          <div className="flex flex-wrap gap-2 mt-1">
            {cast.slice(0, 5).map((name) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/70 font-medium shrink-0">
                  {name.charAt(0)}
                </div>
                <span className="text-sm text-white/70">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {directors.length > 0 && (
        <div className="mb-6">
          <SectionHeader>Director</SectionHeader>
          <p className="text-sm text-white/70">{directors.join(', ')}</p>
        </div>
      )}

      {writers.length > 0 && (
        <div className="mb-6">
          <SectionHeader>Writer</SectionHeader>
          <p className="text-sm text-white/70">{writers.slice(0, 5).join(', ')}</p>
        </div>
      )}

      {isValidField(movie.boxOffice) && (
        <div>
          <SectionHeader>Box Office</SectionHeader>
          <p className="text-sm text-white font-semibold">{movie.boxOffice}</p>
        </div>
      )}
    </>
  )
}
