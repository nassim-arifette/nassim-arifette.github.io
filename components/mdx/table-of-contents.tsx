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
  defaultCollapsed?: boolean
}

export function TableOfContents({ headings, className, defaultCollapsed = false }: TableOfContentsProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const contentId = React.useId()

  if (!headings?.length) return null

  return (
    <nav
      aria-label="Table of contents"
      className={cn('border-y border-border py-4 text-sm text-muted-foreground', className)}
    >
      <button
        type="button"
        onClick={() => setIsCollapsed((previous) => !previous)}
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
        className="flex min-h-11 w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [@media(pointer:coarse)]:min-h-12"
      >
        <span>On this page</span>
        <span aria-hidden="true" className="text-base leading-none text-muted-foreground">
          {isCollapsed ? '+' : '-'}
        </span>
      </button>
      <div
        aria-hidden={isCollapsed}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none',
          isCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100',
        )}
      >
        <div className="overflow-hidden">
          <ul className="space-y-2 border-t border-border pt-3" id={contentId}>
            {headings.map((heading) => (
              <li key={heading.id} className={cn(heading.level === 3 && 'pl-4', heading.level === 4 && 'pl-8')}>
                <a
                  href={`#${heading.id}`}
                  tabIndex={isCollapsed ? -1 : undefined}
                  className="block leading-5 text-foreground/75 transition-colors hover:text-signal"
                >
                  {heading.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
