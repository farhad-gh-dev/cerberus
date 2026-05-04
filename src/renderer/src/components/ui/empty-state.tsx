import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-custom-500 dark:text-custom-400 ${className}`}
    >
      <div className="mb-3">{icon}</div>
      <p className="text-lg">{title}</p>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
