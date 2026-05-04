import { readFileSync } from 'fs'
import chardet from 'chardet'

// SRT files in the wild aren't always UTF-8 (Persian releases are usually windows-1256).
function decodeBuffer(buf: Buffer): string {
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(buf.subarray(3))
  }
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(buf.subarray(2))
  }
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(buf.subarray(2))
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    const detected = chardet.detect(buf) || 'windows-1256'
    try {
      return new TextDecoder(detected.toLowerCase()).decode(buf)
    } catch {
      return new TextDecoder('windows-1256').decode(buf)
    }
  }
}

/** Convert SRT to WebVTT. HTML5 <track> only supports WebVTT. */
export function convertSrtToVtt(filePath: string): string {
  const srt = decodeBuffer(readFileSync(filePath))

  const vtt = srt
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
    // SSA/ASS positioning directives ({\an8}, {\pos(...)}) — invalid in VTT.
    .replace(/\{\\[^}]*\}/g, '')

  return 'WEBVTT\n\n' + vtt.trim() + '\n'
}
