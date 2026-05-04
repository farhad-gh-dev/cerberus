import type { ElementType } from 'react'
import type { LucideProps } from 'lucide-react'

interface CategoryTabProps {
  label: string
  icon: ElementType<LucideProps>
  isActive: boolean
  onClick: () => void
}

export default function CategoryTab({ label, icon: Icon, isActive, onClick }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm xl:px-4 xl:py-2 xl:text-base font-medium transition-colors ${
        isActive
          ? 'bg-custom-800 text-custom-50 dark:bg-custom-50 dark:text-custom-800'
          : 'text-custom-500 hover:text-custom-700 dark:text-custom-400 dark:hover:text-custom-200'
      }`}
    >
      <Icon size={15} className="xl:size-[18px]" />
      {label}
    </button>
  )
}
