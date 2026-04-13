import { readFileSync } from 'fs'

/**
 * Convert SRT subtitle content to WebVTT format.
 * HTML5 <track> only supports WebVTT, so .srt files must be converted.
 */
export function convertSrtToVtt(filePath: string): string {
  const srt = readFileSync(filePath, 'utf-8')

  // Replace SRT timestamp commas with VTT dots and prepend WEBVTT header
  const vtt = srt
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')

  return 'WEBVTT\n\n' + vtt.trim() + '\n'
}
