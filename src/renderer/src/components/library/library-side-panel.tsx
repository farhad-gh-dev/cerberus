import type { LibraryMovie } from '@shared/types'
import { isValidField, parseList } from '../../utils/formatters'

export default function LibrarySidePanel({ movie }: { movie: LibraryMovie }) {
  return (
    <>
      {isValidField(movie.director) && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">
            Director
          </h3>
          <p className="text-sm text-white/70">{movie.director}</p>
        </div>
      )}
      {isValidField(movie.actors) && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            Cast
          </h3>
          <div className="flex flex-wrap gap-2">
            {parseList(movie.actors)
              .slice(0, 5)
              .map((name) => (
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
      <p className="text-xs text-white/30">Added {new Date(movie.addedAt).toLocaleDateString()}</p>
    </>
  )
}
