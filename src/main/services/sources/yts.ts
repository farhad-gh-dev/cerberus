import axios from 'axios'
import type { TorrentSource } from './torrent-source'
import type { TorrentResult, YTSListResponse } from '../../../shared/types'
import { ANNOUNCE_TRACKERS } from '../../config/trackers'

const YTS_BASE = 'https://yts.bz/api/v2'

function buildMagnet(hash: string, title: string): string {
  const encodedTitle = encodeURIComponent(title)
  const trackers = ANNOUNCE_TRACKERS.map((t) => `&tr=${encodeURIComponent(t)}`).join('')
  return `magnet:?xt=urn:btih:${hash}&dn=${encodedTitle}${trackers}`
}

export const ytsSource: TorrentSource = {
  name: 'YTS',

  async search(query: string, imdbId?: string): Promise<TorrentResult[]> {
    try {
      const params: Record<string, string | number> = { limit: 20 }

      if (imdbId) {
        params.query_term = imdbId
      } else {
        params.query_term = query
      }

      const { data } = await axios.get<YTSListResponse>(`${YTS_BASE}/list_movies.json`, {
        params
      })

      if (data.status !== 'ok' || !data.data.movies) {
        return []
      }

      const results: TorrentResult[] = []

      for (const movie of data.data.movies) {
        for (const torrent of movie.torrents) {
          results.push({
            source: 'YTS',
            name: `${movie.title_long} [${torrent.quality}] [${torrent.type}]`,
            magnetLink: buildMagnet(torrent.hash, movie.title_long),
            size: torrent.size,
            seeds: torrent.seeds,
            peers: torrent.peers,
            quality: torrent.quality
          })
        }
      }

      // Sort by seeds descending
      results.sort((a, b) => b.seeds - a.seeds)
      return results
    } catch {
      console.error('YTS search failed')
      return []
    }
  }
}
