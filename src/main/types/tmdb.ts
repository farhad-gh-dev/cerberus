export interface TMDbFindResult {
  movie_results: {
    id: number
    backdrop_path: string | null
    poster_path: string | null
  }[]
}

export interface TMDbSearchResult {
  id: number
  title: string
  release_date: string
  poster_path: string | null
  overview: string
  genre_ids: number[]
  vote_average: number
  original_language: string
}

export interface TMDbSearchResponse {
  results: TMDbSearchResult[]
  total_results: number
  total_pages: number
  page: number
}

export interface TMDbMovieDetail {
  id: number
  imdb_id: string | null
  title: string
  original_language: string
  release_date: string
  runtime: number | null
  genres: { id: number; name: string }[]
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  budget: number
  revenue: number
  status: string
  tagline: string
  production_countries: { iso_3166_1: string; name: string }[]
}

export interface TMDbCredits {
  cast: { id: number; name: string; character: string; order: number }[]
  crew: { id: number; name: string; job: string; department: string }[]
}

export interface TMDbReleaseDates {
  results: {
    iso_3166_1: string
    release_dates: { certification: string; type: number }[]
  }[]
}

export interface TMDbTrendingItem {
  id: number
  title: string
  original_title: string
  original_language: string
  overview: string
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  genre_ids: number[]
  popularity: number
  vote_average: number
  vote_count: number
  adult: boolean
}

export interface TMDbExternalIds {
  imdb_id: string | null
}

/** Combined response when using `append_to_response=credits,release_dates,external_ids` */
export interface TMDbMovieDetailFull extends TMDbMovieDetail {
  credits: TMDbCredits
  release_dates: TMDbReleaseDates
  external_ids: TMDbExternalIds
}
