const RELEASE_TAG_PATTERN =
  /\b(2160p|1080p|720p|480p|360p|4k|uhd|hdr|hdr10|dv|dolby|bluray|bdrip|brrip|webrip|web-?dl|hdrip|dvdrip|dvdscr|hdtv|cam|ts|tc|telesync|telecine|x264|x265|h\.?264|h\.?265|hevc|avc|xvid|divx|aac|ac3|dts|ddp?5\.?1|atmos|truehd|10bit|8bit|repack|proper|extended|remastered|directors?|imax|multi|dual|yify|yts|rarbg|sparks|amzn|nf|hulu|dsnp|hmax)\b/i

export function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

export function parseMovieFilename(path: string): { query: string; year?: string } {
  const fileName = basename(path).replace(/\.[^.]+$/, '')

  let s = fileName.replace(/[._]/g, ' ').replace(/[[\](){}]/g, ' ')

  // Prefer the last year occurrence
  const yearMatches = [...s.matchAll(/\b(19\d{2}|20\d{2})\b/g)]
  let year: string | undefined
  if (yearMatches.length > 0) {
    const last = yearMatches[yearMatches.length - 1]
    year = last[1]
    s = s.slice(0, last.index!)
  } else {
    const tagMatch = s.match(RELEASE_TAG_PATTERN)
    if (tagMatch) s = s.slice(0, tagMatch.index!)
  }

  const query = s.replace(/-/g, ' ').replace(/\s+/g, ' ').trim()

  return year ? { query, year } : { query }
}
