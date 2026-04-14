import { FileVideo, Download } from 'lucide-react'

interface LibraryFooterProps {
  hasFile: boolean
  resolvedVideo: string | null
  filePath?: string
  onPickVideo: () => void
}

export default function LibraryFooter({
  hasFile,
  resolvedVideo,
  filePath,
  onPickVideo
}: LibraryFooterProps) {
  if (hasFile) {
    return (
      <div className="mt-6 space-y-2">
        <div className="flex items-start gap-2">
          <FileVideo size={14} className="text-white/40 mt-0.5 shrink-0" />
          <p className="text-[11px] text-white/40 break-all flex-1">
            <span className="text-white/50 font-medium">Video source: </span>
            {resolvedVideo || filePath}
          </p>
          <button
            onClick={onPickVideo}
            className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors shrink-0"
          >
            Change
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 flex items-center gap-2 text-yellow-400/70">
      <Download size={14} />
      <p className="text-[11px]">
        Not yet downloaded — use <span className="font-medium">Find Torrents</span> to get this
        movie
      </p>
    </div>
  )
}
