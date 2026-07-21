import * as React from 'react'

type BadgeVariant = 'default' | 'secondary'

const badgeBaseClasses =
  'inline-flex min-h-8 items-center justify-center border border-border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] [@media(pointer:coarse)]:min-h-12 [@media(pointer:coarse)]:min-w-12 [@media(pointer:coarse)]:px-3 [@media(pointer:coarse)]:py-2'

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  secondary: 'bg-transparent text-muted-foreground',
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
