import { ipcMain, shell } from 'electron'
import type { LibraryMovie } from '../../shared/types'
import {
  getAllMovies,
  addMovie,
  removeMovie,
  getMovieByImdbId,
  updateMoviePath,
  clearFilePath,
  clearLibrary,
  resolveVideoFile,
  openInPlayer,
  pickVideoDialog,
  findSubtitleFiles
} from '../services/library'

export function registerLibraryHandlers(): void {
  ipcMain.handle('library:list', () => getAllMovies())

  ipcMain.handle('library:get', (_event, imdbId: string) => getMovieByImdbId(imdbId))

  ipcMain.handle('library:add', (_event, movie: Omit<LibraryMovie, 'id' | 'addedAt'>) =>
    addMovie(movie)
  )

  ipcMain.handle('library:remove', (_event, id: number, deleteSource?: boolean) =>
    removeMovie(id, deleteSource)
  )

  ipcMain.handle('library:open-file', (_event, filePath: string) => openInPlayer(filePath))

  ipcMain.handle('library:open-folder', (_event, filePath: string) =>
    shell.showItemInFolder(filePath)
  )

  ipcMain.handle(
    'library:resolve-video',
    (_event, filePath: string, movieTitle?: string, movieYear?: string) =>
      resolveVideoFile(filePath, movieTitle, movieYear)
  )

  ipcMain.handle('library:pick-video', () => pickVideoDialog())

  ipcMain.handle('library:set-video-path', (_event, id: number, filePath: string) =>
    updateMoviePath(id, filePath)
  )

  ipcMain.handle('library:clear-file', (_event, id: number, deleteSource?: boolean) =>
    clearFilePath(id, deleteSource)
  )

  ipcMain.handle('library:clear', () => {
    clearLibrary()
    return true
  })

  ipcMain.handle('library:resolve-subtitles', (_event, videoPath: string) =>
    findSubtitleFiles(videoPath)
  )
}
