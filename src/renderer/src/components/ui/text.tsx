import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type TextSize = 'xs' | 'sm' | 'base' | 'lg'
type TextVariant = 'default' | 'muted' | 'accent'

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: TextSize
  variant?: TextVariant
  as?: 'p' | 'span' | 'div'
}

const sizeStyles: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg'
}

const variantStyles: Record<TextVariant, string> = {
  default: 'text-custom-700 dark:text-custom-200',
  muted: 'text-custom-500 dark:text-custom-400',
  accent: 'text-blue-500 dark:text-blue-400'
}

export default function Text({
  size = 'base',
  variant = 'default',
  as: Tag = 'p',
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag className={cn(sizeStyles[size], variantStyles[variant], className)} {...props}>
      {children}
    </Tag>
  )
}
