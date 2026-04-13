import { ipcMain } from 'electron'
import { searchOnlineSubtitles, downloadOnlineSubtitle } from '../services/opensubtitles'
import { searchSubdl, downloadSubdl } from '../services/subdl'
import { getSetting } from '../services/settings'
import type { OnlineSubtitleResult } from '../../shared/types'

export function registerSubtitleHandlers(): void {
  // Search: use the provider selected in settings
  ipcMain.handle(
    'subtitles:search-online',
    async (_event, imdbId: string, language?: string): Promise<OnlineSubtitleResult[]> => {
      const provider = getSetting('subtitleProvider')

      if (provider === 'subdl') {
        const key = getSetting('subdlApiKey')
        if (!key) throw new Error('No Subdl API key configured. Add one in Settings.')
        return searchSubdl(imdbId, language)
      } else {
        const key = getSetting('openSubtitlesApiKey')
        if (!key) throw new Error('No OpenSubtitles API key configured. Add one in Settings.')
        return searchOnlineSubtitles(imdbId, language)
      }
    }
  )

  // Download: route to the correct provider based on ID prefix
  ipcMain.handle('subtitles:download', async (_event, resultId: string, videoFilePath: string) => {
    if (resultId.startsWith('subdl:')) {
      const downloadUrl = resultId.slice('subdl:'.length)
      return downloadSubdl(downloadUrl, videoFilePath)
    } else if (resultId.startsWith('os:')) {
      const fileId = parseInt(resultId.slice('os:'.length), 10)
      return downloadOnlineSubtitle(fileId, videoFilePath)
    }
    throw new Error('Unknown subtitle provider')
  })
}
