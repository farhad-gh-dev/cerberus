import { FileVideo, Trash2 } from 'lucide-react'
import Text from '../../ui/text'

interface FileRowProps {
  filePath: string
  onClear: () => void
}

function formatFileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

function getFileNameWithoutExtension(path: string): string {
  const fileName = formatFileName(path)
  const lastDotIndex = fileName.lastIndexOf('.')

  if (lastDotIndex <= 0) return fileName

  return fileName.slice(0, lastDotIndex)
}

function getFileFormat(path: string): string {
  const fileName = formatFileName(path)
  const lastDotIndex = fileName.lastIndexOf('.')

  if (lastDotIndex <= 0 || lastDotIndex === fileName.length - 1) return 'VIDEO FILE'

  return fileName.slice(lastDotIndex + 1).toUpperCase()
}

export default function FileRow({ filePath, onClear }: FileRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-custom-200 bg-custom-50 px-4 py-3 dark:border-custom-700 dark:bg-custom-800/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-custom-200 text-custom-600 dark:bg-custom-700/60 dark:text-custom-100">
        <FileVideo size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <Text size="sm" className="truncate font-medium text-zinc-900 dark:text-white">
          {getFileNameWithoutExtension(filePath)}
        </Text>
        <Text size="xs" className="text-zinc-500 dark:text-zinc-400">
          {getFileFormat(filePath)}
        </Text>
      </div>
      <button
        onClick={onClear}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-custom-400 transition-colors hover:bg-custom-200 hover:text-red-500 dark:text-custom-500 dark:hover:bg-custom-700 dark:hover:text-red-400"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
