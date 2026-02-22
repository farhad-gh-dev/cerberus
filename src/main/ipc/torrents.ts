import { ipcMain } from 'electron'
import { searchTorrents } from '../services/torrent-search'

export function registerTorrentHandlers(): void {
  ipcMain.handle('torrent:search', async (_event, query: string, imdbId?: string) => {
    return searchTorrents(query, imdbId)
  })
}
