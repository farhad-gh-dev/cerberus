import axios from 'axios'
import { createWriteStream } from 'fs'
import { join, dirname } from 'path'
import { pipeline } from 'stream/promises'
import type { OnlineSubtitleResult, SubtitleTrack } from '../../shared/types'
import { getSetting } from './settings'

const OS_BASE = 'https://api.opensubtitles.com/api/v1'

function osClient() {
  const apiKey = getSetting('openSubtitlesApiKey')
  return axios.create({
    baseURL: OS_BASE,
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'Cerberus v0.1.0'
    }
  })
}

interface OSSubtitleAttributes {
  subtitle_id: string
  language: string
  download_count: number
  ratings: number
  release: string
  files: {
    file_id: number
    file_name: string
  }[]
  feature_details?: {
    feature_type: string
    imdb_id: number
    title: string
    year: number
  }
}

interface OSSearchResponse {
  total_pages: number
  total_count: number
  page: number
  data: {
    id: string
    type: string
    attributes: OSSubtitleAttributes
  }[]
}

interface OSDownloadResponse {
  link: string
  file_name: string
  requests: number
  remaining: number
  message: string
}

/**
 * Search for subtitles on OpenSubtitles by IMDB ID.
 */
export async function searchOnlineSubtitles(
  imdbId: string,
  language?: string
): Promise<OnlineSubtitleResult[]> {
  const apiKey = getSetting('openSubtitlesApiKey')
  if (!apiKey) throw new Error('OpenSubtitles API key is not configured')

  const numericId = parseInt(imdbId.replace(/^tt/, ''), 10)
  if (isNaN(numericId)) throw new Error(`Invalid IMDB ID: ${imdbId}`)

  const params: Record<string, string | number> = {
    imdb_id: numericId,
    order_by: 'download_count',
    order_direction: 'desc'
  }
  if (language) {
    params.languages = language
  }

  const { data } = await osClient().get<OSSearchResponse>('/subtitles', { params })

  const results: OnlineSubtitleResult[] = []
  if (!data?.data) return results

  for (const item of data.data) {
    const attr = item.attributes
    if (!attr.files || attr.files.length === 0) continue

    const file = attr.files[0]
    const ext = file.file_name?.split('.').pop()?.toLowerCase() || 'srt'

    results.push({
      id: `os:${file.file_id}`,
      provider: 'opensubtitles',
      fileName: file.file_name || `subtitle_${file.file_id}.srt`,
      language: attr.language,
      languageCode: attr.language,
      downloadCount: attr.download_count,
      rating: attr.ratings,
      format: ext
    })
  }

  return results
}

/**
 * Download a subtitle file from OpenSubtitles and save it next to the video.
 * Returns the resulting SubtitleTrack.
 */
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function downloadOnlineSubtitle(
  fileId: number,
  videoFilePath: string
): Promise<SubtitleTrack | null> {
  const apiKey = getSetting('openSubtitlesApiKey')
  if (!apiKey) throw new Error('OpenSubtitles API key is not configured')

  // Step 1: Get the download link (with retry for transient errors)
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data } = await osClient().post<OSDownloadResponse>('/download', {
        file_id: fileId
      })

      if (!data.link) {
        throw new Error('No download link returned from OpenSubtitles')
      }

      // Step 2: Download the file to the same directory as the video
      const dir = dirname(videoFilePath)
      const fileName = data.file_name || `subtitle_${fileId}.srt`
      const savePath = join(dir, fileName)

      const response = await axios.get(data.link, { responseType: 'stream' })
      await pipeline(response.data, createWriteStream(savePath))

      const ext = fileName.split('.').pop()?.toLowerCase() || 'srt'
      const baseName = fileName.replace(/\.[^.]+$/, '')

      return {
        filePath: savePath,
        label: baseName,
        language: '',
        format: ext
      }
    } catch (err) {
      lastError = err
      const status = (err as { response?: { status?: number } })?.response?.status
      // Only retry on transient server errors
      if (status && status >= 500 && attempt < MAX_RETRIES) {
        console.warn(
          `[opensubtitles] download attempt ${attempt} failed (${status}), retrying in ${RETRY_DELAY_MS}ms…`
        )
        await sleep(RETRY_DELAY_MS)
        continue
      }
      break
    }
  }

  // All retries exhausted
  const status = (lastError as { response?: { status?: number } })?.response?.status
  if (status === 503) {
    throw new Error('OpenSubtitles service is temporarily unavailable. Please try again later.')
  }
  throw lastError
}
