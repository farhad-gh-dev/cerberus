import type { TorrentSource } from './sources/torrent-source'
import type { TorrentResult } from '../../shared/types'
import { ytsSource } from './sources/yts'

const sources: TorrentSource[] = [ytsSource]

export async function searchTorrents(query: string, imdbId?: string): Promise<TorrentResult[]> {
  // Search all sources in parallel
  const results = await Promise.allSettled(sources.map((s) => s.search(query, imdbId)))

  const combined: TorrentResult[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      combined.push(...result.value)
    }
  }

  // Sort combined results by seeds
  combined.sort((a, b) => b.seeds - a.seeds)
  return combined
}
