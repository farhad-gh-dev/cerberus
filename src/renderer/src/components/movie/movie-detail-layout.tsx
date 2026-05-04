import type { ReactNode } from 'react'
import { Film } from 'lucide-react'

interface MovieDetailLayoutProps {
  heroImage: string | null
  backdropLoading: boolean
  navButton: ReactNode
  genres: string[]
  title: string
  meta: ReactNode
  plot?: string
  actions: ReactNode
  sidePanel: ReactNode
  footer?: ReactNode
}

export default function MovieDetailLayout({
  heroImage,
  backdropLoading,
  navButton,
  genres,
  title,
  meta,
  plot,
  actions,
  sidePanel,
  footer
}: MovieDetailLayoutProps): ReactNode {
  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      {heroImage ? (
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div
          className={`absolute inset-0 bg-custom-800 flex items-center justify-center${backdropLoading ? ' animate-pulse' : ''}`}
        >
          <Film size={80} className="text-custom-700" />
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Navigation button */}
      {navButton}

      {/* Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left: movie info */}
        <div className="flex-1 flex flex-col justify-end p-10 pb-12 max-w-2xl">
          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/80"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl font-bold text-white leading-tight">{title}</h1>

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-4 text-sm text-white/70">{meta}</div>

          {/* Plot */}
          {plot && <p className="mt-5 text-sm text-white/60 leading-relaxed max-w-lg">{plot}</p>}

          {/* Action buttons */}
          <div className="flex gap-3 mt-8">{actions}</div>

          {/* Footer (e.g. file path) */}
          {footer}
        </div>

        {/* Right: side panel */}
        <div className="w-80 flex flex-col justify-end p-10 pb-12">{sidePanel}</div>
      </div>
    </div>
  )
}
