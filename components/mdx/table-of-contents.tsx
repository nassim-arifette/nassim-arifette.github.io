import { cn } from '@/lib/utils'

export interface TocHeading {
  id: string
  title: string
  level: number
}

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  if (!headings?.length) return null

  return (
    <details className="not-prose my-8 rounded border border-border px-4 py-3 text-sm">
      <summary className="cursor-pointer select-none font-medium">Contents</summary>
      <ul className="mt-3 space-y-1.5 text-muted-foreground">
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.level === 3 && 'pl-4', heading.level >= 4 && 'pl-8')}>
            <a href={`#${heading.id}`} className="hover:text-foreground">
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}
