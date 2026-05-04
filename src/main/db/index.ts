import { app } from 'electron'
import { join } from 'path'
import { readFileSync, existsSync, rmSync, statSync } from 'fs'
import type { LibraryMovie } from '../../shared/types'
import { createJsonWriter } from '../services/json-writer'

interface LibraryData {
  nextId: number
  movies: LibraryMovie[]
}

const DATA_FILE = join(app.getPath('userData'), 'library.json')

let data: LibraryData | null = null
const writer = createJsonWriter<LibraryData>(DATA_FILE)

function load(): LibraryData {
  if (data) return data
  if (existsSync(DATA_FILE)) {
    try {
      data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
    } catch {
      data = { nextId: 1, movies: [] }
    }
  } else {
    data = { nextId: 1, movies: [] }
  }
  return data!
}

function save(): void {
  writer.schedule(load())
}

export function flushLibrarySync(): void {
  writer.flushSync()
}

/** Delete a file or directory from disk, ignoring errors if it's already missing. */
function deleteFileOrDir(filePath: string): void {
  try {
    const stat = statSync(filePath)
    if (stat.isDirectory()) {
      rmSync(filePath, { recursive: true, force: true })
    } else {
      rmSync(filePath, { force: true })
    }
  } catch {
    // source may already be missing
  }
}

export function getAllMovies(): LibraryMovie[] {
  return [...load().movies].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  )
}

export function getMovieByImdbId(imdbId: string): LibraryMovie | null {
  return load().movies.find((m) => m.imdbId === imdbId) || null
}

export function addMovie(movie: Omit<LibraryMovie, 'id' | 'addedAt'>): LibraryMovie {
  const store = load()

  const existingIndex = store.movies.findIndex((m) => m.imdbId === movie.imdbId)
  if (existingIndex !== -1) {
    store.movies[existingIndex] = { ...store.movies[existingIndex], ...movie }
    save()
    return store.movies[existingIndex]
  }

  const entry: LibraryMovie = {
    ...movie,
    id: store.nextId++,
    addedAt: new Date().toISOString()
  }
  store.movies.push(entry)
  save()
  return entry
}

export function updateMoviePath(id: number, filePath: string): boolean {
  const store = load()
  const movie = store.movies.find((m) => m.id === id)
  if (!movie) return false
  movie.filePath = filePath
  save()
  return true
}

export function clearFilePath(id: number, deleteSource?: boolean): boolean {
  const store = load()
  const movie = store.movies.find((m) => m.id === id)
  if (!movie) return false

  if (deleteSource && movie.filePath) {
    deleteFileOrDir(movie.filePath)
  }

  delete movie.filePath
  save()
  return true
}

export function removeMovie(id: number, deleteSource?: boolean): boolean {
  const store = load()
  const movie = store.movies.find((m) => m.id === id)
  if (!movie) return false

  if (deleteSource && movie.filePath) {
    deleteFileOrDir(movie.filePath)
  }

  store.movies = store.movies.filter((m) => m.id !== id)
  save()
  return true
}

export function clearLibrary(): void {
  const store = load()
  store.movies = []
  store.nextId = 1
  save()
}
