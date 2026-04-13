import { ipcMain } from 'electron'
import {
  getBackdropByImdbId,
  getTrendingMovies,
  searchMovies,
  getMovieDetails
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
}
