import { usePlayerContext } from './player-context'

const ALLOWED_TAGS = new Set(['b', 'i', 'u', 'em', 'strong', 'br', 'span'])

/** Strip everything except safe subtitle-formatting tags. */
function sanitizeCueHtml(html: string): string {
  return html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag: string) => {
    return ALLOWED_TAGS.has(tag.toLowerCase()) ? match : ''
  })
}

export default function SubtitleOverlay() {
  const { subtitles } = usePlayerContext()

  if (!subtitles.activeCueText) return null

  return (
    <div
      className="absolute left-0 right-0 flex justify-center pointer-events-none px-12"
      style={{ bottom: `${subtitles.bottomOffset}%` }}
    >
      <span
        className="text-white px-4 py-1.5 text-center whitespace-pre-line drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
        style={{ fontSize: subtitles.fontSize }}
        dangerouslySetInnerHTML={{ __html: sanitizeCueHtml(subtitles.activeCueText) }}
      />
    </div>
  )
}
