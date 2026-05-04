import { readFileSync } from 'fs'

/** Convert SRT to WebVTT. HTML5 <track> only supports WebVTT. */
export function convertSrtToVtt(filePath: string): string {
  let srt = readFileSync(filePath, 'utf-8')

  // Strip UTF-8 BOM (common in OpenSubtitles releases) — browsers reject
  // the cue list if it precedes the WEBVTT header.
  if (srt.charCodeAt(0) === 0xfeff) {
    srt = srt.slice(1)
  }

  const vtt = srt
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
    // SSA/ASS positioning directives ({\an8}, {\pos(...)}) — invalid in VTT.
    .replace(/\{\\[^}]*\}/g, '')

  return 'WEBVTT\n\n' + vtt.trim() + '\n'
}
