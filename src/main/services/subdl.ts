import axios from 'axios'
import { createWriteStream } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { pipeline } from 'stream/promises'
import { tmpdir } from 'os'
import { readdir, copyFile, mkdtemp, rm, stat } from 'fs/promises'
import extract from 'extract-zip'
import type { OnlineSubtitleResult, SubtitleTrack } from '../../shared/types'
import { getSetting } from './settings'

const SUBDL_BASE = 'https://api.subdl.com/api/v1'
const SUBDL_CDN = 'https://dl.subdl.com'

interface SubdlSubtitle {
  release_name: string
  name: string
  lang: string
  author: string | null
  url: string
  subtitlePage: string
  season: number | null
  episode: number | null
  language: string
  hi: boolean
  download_count?: number
  rating?: number
}

interface SubdlSearchResponse {
  status: boolean
  results: {
    sd_id: number
    type: string
    name: string
    imdb_id: string
    tmdb_id: number
    first_air_date: string | null
    year: number
  }[]
  subtitles: SubdlSubtitle[]
}

/**
 * Search for subtitles on Subdl by IMDB ID.
 */
export async function searchSubdl(
  imdbId: string,
  language?: string
): Promise<OnlineSubtitleResult[]> {
  const apiKey = getSetting('subdlApiKey')
  if (!apiKey) throw new Error('Subdl API key is not configured')

  const params: Record<string, string> = {
    api_key: apiKey,
    imdb_id: imdbId,
    type: 'movie',
    subs_per_page: '30'
  }
  if (language) {
    params.languages = language
  }

  const { data } = await axios.get<SubdlSearchResponse>(`${SUBDL_BASE}/subtitles`, { params })

  const results: OnlineSubtitleResult[] = []
  if (!data?.status || !data.subtitles?.length) return results

  for (const sub of data.subtitles) {
    const ext = sub.name?.split('.').pop()?.toLowerCase() || 'srt'
    results.push({
      id: `subdl:${SUBDL_CDN}${sub.url}`,
      provider: 'subdl',
      fileName: sub.release_name || sub.name,
      language: sub.language || sub.lang,
      languageCode: sub.lang,
      downloadCount: sub.download_count || 0,
      rating: sub.rating || 0,
      format: ext === 'zip' ? 'srt' : ext,
      downloadUrl: `${SUBDL_CDN}${sub.url}`
    })
  }

  return results
}

/**
 * Download a subtitle from Subdl (ZIP containing subtitle file)
 * and save it next to the video. Returns the resulting SubtitleTrack.
 */
export async function downloadSubdl(
  downloadUrl: string,
  videoFilePath: string
): Promise<SubtitleTrack | null> {
  const subtitleExts = new Set(['.srt', '.vtt', '.ass', '.ssa', '.sub'])
  const videoDir = dirname(videoFilePath)

  // Download ZIP to a temp directory
  const tempDir = await mkdtemp(join(tmpdir(), 'subdl-'))
  const zipPath = join(tempDir, 'subtitle.zip')

  try {
    const response = await axios.get(downloadUrl, { responseType: 'stream' })
    await pipeline(response.data, createWriteStream(zipPath))

    await extract(zipPath, { dir: tempDir })

    const subtitlePath = await findSubtitleRecursively(tempDir, subtitleExts)

    if (!subtitlePath) {
      throw new Error('No subtitle file found in the downloaded archive')
    }

    const subtitleName = basename(subtitlePath)
    const destPath = join(videoDir, subtitleName)
    // copyFile (not rename) — temp dir and destination may be on different drives (EXDEV).
    await copyFile(subtitlePath, destPath)

    const ext = extname(subtitleName).slice(1).toLowerCase() || 'srt'
    const label = subtitleName.replace(/\.[^.]+$/, '')

    return {
      filePath: destPath,
      label,
      language: '',
      format: ext
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {})
  }
}

// Subdl archives sometimes nest the subtitle inside a folder; recurse so we don't miss it.
async function findSubtitleRecursively(dir: string, exts: Set<string>): Promise<string | null> {
  const entries = await readdir(dir).catch(() => [] as string[])
  for (const entry of entries) {
    const full = join(dir, entry)
    const info = await stat(full).catch(() => null)
    if (!info) continue
    if (info.isDirectory()) {
      const nested = await findSubtitleRecursively(full, exts)
      if (nested) return nested
    } else if (exts.has(extname(entry).toLowerCase())) {
      return full
    }
  }
  return null
}
