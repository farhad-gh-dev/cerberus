import { ipcMain } from 'electron'
import {
  getBackdropByImdbId,
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  searchMovies,
  getMovieDetails,
  enrichMovie
} from '../services/tmdb'

export function registerMovieHandlers(): void {
  ipcMain.handle('movies:search', async (_event, query: string, page?: number) => {
    return searchMovies(query, page)
  })

  ipcMain.handle('movies:details', async (_event, tmdbId: number) => {
    return getMovieDetails(tmdbId)
  })

  ipcMain.handle('tmdb:backdrop', async (_event, imdbId: string) => {
    return getBackdropByImdbId(imdbId)
  })

  ipcMain.handle('tmdb:trending', async (_event, page?: number) => {
    return getTrendingMovies(page)
  })

  ipcMain.handle('tmdb:popular', async (_event, page?: number) => {
    return getPopularMovies(page)
  })

  ipcMain.handle('tmdb:top-rated', async (_event, page?: number) => {
    return getTopRatedMovies(page)
  })

  ipcMain.handle('tmdb:enrich', async (_event, tmdbId: number, title: string) => {
    return enrichMovie(tmdbId, title)
  })
}
