import type { LibraryMovie } from '@shared/types'
import type { SortOption } from '../components/library-toolbar'

export function sortMovies(movies: LibraryMovie[], sort: SortOption): LibraryMovie[] {
  const sorted = [...movies]
  switch (sort) {
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case 'rating-desc':
      return sorted.sort(
        (a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0)
      )
    case 'rating-asc':
      return sorted.sort(
        (a, b) => (parseFloat(a.imdbRating) || 0) - (parseFloat(b.imdbRating) || 0)
      )
    case 'year-desc':
      return sorted.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0))
    case 'year-asc':
      return sorted.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0))
    case 'added-desc':
      return sorted.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    case 'added-asc':
      return sorted.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime())
    default:
      return sorted
  }
}
