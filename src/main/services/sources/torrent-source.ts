import type { TorrentResult } from '../../../shared/types'

export interface TorrentSource {
  name: string
  search(query: string, imdbId?: string): Promise<TorrentResult[]>
}
