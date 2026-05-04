import type { HTMLAttributes, ElementType } from 'react'
import { cn } from '../../utils/cn'

type HeadingLevel = 1 | 2 | 3 | 4

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel
}

const styles: Record<HeadingLevel, string> = {
  1: 'text-3xl font-bold',
  2: 'text-2xl font-semibold',
  3: 'text-xl font-semibold',
  4: 'text-lg font-medium'
}

export default function Heading({ level = 1, className, children, ...props }: HeadingProps) {
  const Tag = `h${level}` as ElementType
  return (
    <Tag className={cn('text-custom-800 dark:text-custom-50', styles[level], className)} {...props}>
      {children}
    </Tag>
  )
}
