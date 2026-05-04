import type { ReactNode } from 'react'

interface MovieGridProps {
  children: ReactNode
  className?: string
}

export default function MovieGrid({ children, className = '' }: MovieGridProps) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 xl:gap-4 ${className}`}
    >
      {children}
    </div>
  )
}
