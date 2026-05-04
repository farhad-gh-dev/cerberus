import { FolderOpen, Paperclip } from 'lucide-react'
import Text from '../../ui/text'

interface DropZoneProps {
  onPickFiles: () => void
  onPickFolder?: () => void
  supportedFormats?: string
}

export default function DropZone({
  onPickFiles,
  onPickFolder,
  supportedFormats = 'Supported Formats: MP4, MKV, AVI, MOV, WebM'
}: DropZoneProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onPickFiles}
        className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-custom-300 bg-custom-50 py-8 transition-colors hover:border-custom-400 dark:border-custom-600 dark:bg-custom-800/30 dark:hover:border-custom-500 dark:hover:bg-custom-700/50"
      >
        <Paperclip size={28} className="text-custom-400 dark:text-custom-500" />
        <div className="text-center">
          <Text size="sm" className="text-zinc-600 dark:text-zinc-400">
            Drag & Drop your video files here
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

      {onPickFolder && (
        <button
          onClick={onPickFolder}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-custom-200 bg-custom-50 px-4 py-2.5 text-sm font-medium text-custom-700 transition-colors hover:border-custom-300 hover:bg-custom-100 dark:border-custom-700 dark:bg-custom-800/30 dark:text-custom-200 dark:hover:border-custom-600 dark:hover:bg-custom-700/50"
        >
          <FolderOpen size={16} className="text-custom-500 dark:text-custom-400" />
          Or pick a folder to scan recursively
        </button>
      )}

      <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
        <Text as="span" size="xs" className="text-zinc-500 dark:text-zinc-500">
          {supportedFormats}
        </Text>
      </div>
    </div>
  )
}
