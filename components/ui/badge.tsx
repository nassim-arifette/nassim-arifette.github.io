import * as React from 'react'

type BadgeVariant = 'default' | 'secondary'

export const badgeBaseClasses = 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium'

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  secondary: 'bg-muted text-muted-foreground',
}

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

export function badgeClasses(variant: BadgeVariant = 'default', className = '') {
  return `${badgeBaseClasses} ${badgeVariants[variant]} ${className}`.trim()
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return <span className={badgeClasses(variant, className)} {...props} />
}
