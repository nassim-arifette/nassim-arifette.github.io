import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TocHeading {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  headings: TocHeading[]
  className?: string
}

export function TableOfContents({ headings, className }: TableOfContentsProps) {
  if (!headings?.length) return null

  return (
    <nav
      aria-label="Table of contents"
      className={cn('rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground', className)}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">On this page</p>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.level === 3 && 'pl-4', heading.level === 4 && 'pl-8')}>
            <a
              href={`#${heading.id}`}
              className="block text-foreground/80 transition hover:text-foreground"
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
