import { Paperclip } from 'lucide-react'
import Text from '../../ui/text'

interface DropZoneProps {
  onPickFile: () => void
  supportedFormats?: string
}

export default function DropZone({
  onPickFile,
  supportedFormats = 'Supported Formats: MP4, MKV, AVI, MOV, WebM'
}: DropZoneProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onPickFile}
        className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-custom-300 bg-custom-50 py-8 transition-colors hover:border-custom-400 dark:border-custom-600 dark:bg-custom-800/30 dark:hover:border-custom-500 dark:hover:bg-custom-700/50"
      >
        <Paperclip size={28} className="text-custom-400 dark:text-custom-500" />
        <div className="text-center">
          <Text size="sm" className="text-zinc-600 dark:text-zinc-400">
            Drag & Drop your video file here
          </Text>
          <Text
            size="sm"
            variant="accent"
            className="mt-0.5 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Click to browse
          </Text>
        </div>
      </button>

      <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
        <Text as="span" size="xs" className="text-zinc-500 dark:text-zinc-500">
          {supportedFormats}
        </Text>
      </div>
    </div>
  )
}
