'use client'

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

  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const contentId = React.useId()

  return (
    <nav
      aria-label="Table of contents"
      className={cn('rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground', className)}
    >
      <button
        type="button"
        onClick={() => setIsCollapsed((previous) => !previous)}
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
        className="mb-3 flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground/70"
      >
        <span>On this page</span>
        <span aria-hidden="true" className="text-base leading-none text-muted-foreground">
          {isCollapsed ? '+' : '-'}
        </span>
      </button>
      {!isCollapsed ? (
        <ul className="space-y-2" id={contentId}>
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
      ) : null}
    </nav>
  )
}
