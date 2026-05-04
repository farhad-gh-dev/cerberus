import { spawn } from 'child_process'
import { readdirSync, statSync } from 'fs'
import { join, extname, basename } from 'path'
import { shell, dialog, BrowserWindow } from 'electron'
import { getSetting } from './settings'
import { findTmdbIdByImdbId, getMovieDetails } from './tmdb'

export {
  getAllMovies,
  getMovieByImdbId,
  addMovie,
  updateMoviePath,
  clearFilePath,
  removeMovie,
  clearLibrary
} from '../db'

import { getMovieByImdbId, addMovie, updateMoviePath } from '../db'

export const VIDEO_EXTENSIONS = new Set(['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v', '.wmv'])

const SUBTITLE_EXTENSIONS = new Set(['.srt', '.vtt', '.ass', '.ssa', '.sub'])

function findVideoFiles(dir: string): string[] {
  const results: string[] = []
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory()) results.push(...findVideoFiles(fullPath))
        else if (VIDEO_EXTENSIONS.has(extname(entry).toLowerCase())) results.push(fullPath)
      } catch {
        // skip inaccessible entries
      }
    }
  } catch {
    // dir doesn't exist or not readable
  }
  return results
}

function largestVideo(videos: string[]): string | null {
  if (videos.length === 0) return null
  let best = videos[0]
  let bestSize = 0
  for (const v of videos) {
    try {
      const size = statSync(v).size
      if (size > bestSize) {
        bestSize = size
        best = v
      }
    } catch {
      // skip
    }
  }
  return best
}

function normalizeForMatch(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function resolveVideoFile(
  filePath: string,
  movieTitle?: string,
  movieYear?: string
): string | null {
  // If filePath is already a video file, return it directly
  try {
    const stat = statSync(filePath)
    if (!stat.isDirectory()) {
      if (VIDEO_EXTENSIONS.has(extname(filePath).toLowerCase())) return filePath
      return null
    }
  } catch {
    return null
  }

  const titleNorm = movieTitle ? normalizeForMatch(movieTitle) : null

  // 1. Look for a subfolder matching the movie title
  if (titleNorm) {
    try {
      const entries = readdirSync(filePath)
      for (const entry of entries) {
        const full = join(filePath, entry)
        try {
          if (!statSync(full).isDirectory()) continue
        } catch {
          continue
        }
        const entryNorm = normalizeForMatch(entry)
        const yearMatch = !movieYear || entryNorm.includes(normalizeForMatch(movieYear))
        if (entryNorm.includes(titleNorm) && yearMatch) {
          const videos = findVideoFiles(full)
          const best = largestVideo(videos)
          if (best) return best
        }
      }
    } catch {
      // dir not readable
    }
  }

  // 2. Scan all videos in the directory, prefer ones whose path contains the movie title
  const allVideos = findVideoFiles(filePath)
  if (allVideos.length === 0) return null

  if (titleNorm) {
    const matching = allVideos.filter((v) => {
      const name = normalizeForMatch(basename(v))
      return name.includes(titleNorm)
    })
    const best = largestVideo(matching)
    if (best) return best
  }

  // 3. Fallback: largest video file overall
  return largestVideo(allVideos)
}

function externalPlayerCommand(): string | null {
  if (!getSetting('externalPlayerEnabled')) return null
  const path = getSetting('externalPlayerPath')
  return path || null
}

export function openInPlayer(filePath: string): Promise<string> | string {
  const external = externalPlayerCommand()
  if (external) {
    try {
      const child = spawn(external, [filePath], { detached: true, stdio: 'ignore' })
      child.on('error', (err) => console.warn('[library] external player spawn error:', err))
      try {
        child.unref()
      } catch {
        // ignore: unref is best-effort
      }
      return ''
    } catch (err) {
      console.warn('[library] external player spawn failed, falling back:', err)
      return shell.openPath(filePath)
    }
  }
  return shell.openPath(filePath)
}

/** Launch the configured external player against a URL. False = caller should fall back. */
export function spawnExternalPlayer(url: string): boolean {
  const external = externalPlayerCommand()
  if (!external) return false
  try {
    const child = spawn(external, [url], { detached: true, stdio: 'ignore' })
    child.on('error', (err) => console.warn('[library] external player spawn error:', err))
    try {
      child.unref()
    } catch {
      // ignore: unref is best-effort
    }
    return true
  } catch (err) {
    console.warn('[library] external player spawn failed:', err)
    return false
  }
}

export async function pickVideoDialog(): Promise<string | null> {
  const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
  if (!win) return null
  const extensions = [...VIDEO_EXTENSIONS].map((ext) => ext.slice(1))
  const result = await dialog.showOpenDialog(win, {
    title: 'Select video file',
    filters: [{ name: 'Video Files', extensions }],
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
}

/**
 * Find subtitle files alongside a resolved video file.
 * Scans the same directory as the video for .srt, .vtt, .ass, .ssa, .sub files.
 */
export function findSubtitleFiles(
  videoFilePath: string
): { filePath: string; label: string; language: string; format: string }[] {
  const dir = join(videoFilePath, '..')
  const results: { filePath: string; label: string; language: string; format: string }[] = []

  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const ext = extname(entry).toLowerCase()
      if (!SUBTITLE_EXTENSIONS.has(ext)) continue

      const fullPath = join(dir, entry)
      try {
        if (statSync(fullPath).isDirectory()) continue
      } catch {
        continue
      }

      const format = ext.slice(1) // Remove the dot
      const label = basename(entry, ext)

      results.push({ filePath: fullPath, label, language: '', format })
    }
  } catch {
    // directory not readable
  }

  return results
}

/** Auto-add a completed download to the movie library. */
export async function addCompletedMovieToLibrary(
  imdbId: string,
  basePath: string,
  torrentName?: string
): Promise<void> {
  try {
    const existing = getMovieByImdbId(imdbId)
    const torrentPath = torrentName ? join(basePath, torrentName) : basePath

    if (existing) {
      if (!existing.filePath) {
        updateMoviePath(existing.id, torrentPath)
      }
      return
    }

    const tmdbId = await findTmdbIdByImdbId(imdbId)
    if (!tmdbId) return

    const details = await getMovieDetails(tmdbId)
    if (!details) return

    addMovie({
      imdbId: details.imdbId,
      title: details.title,
      year: details.year,
      posterUrl: details.posterUrl,
      plot: details.plot,
      genre: details.genre,
      director: details.director,
      actors: details.actors,
      imdbRating: details.rating,
      runtime: details.runtime,
      language: details.language,
      filePath: torrentPath
    })
  } catch (err) {
    console.error('Failed to add movie to library:', err)
  }
}
