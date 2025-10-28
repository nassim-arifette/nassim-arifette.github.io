import Link from 'next/link'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { SeriesNavigation, SeriesResolved } from '@/lib/series'
import { cn } from '@/lib/utils'

interface SeriesBannerProps {
  navigation: SeriesNavigation
  seriesData: SeriesResolved
}

export function SeriesBanner({ navigation, seriesData }: SeriesBannerProps) {
  const { current, previous, next } = navigation
  const startPart = seriesData.startPart
  const showNudge = Boolean(startPart && startPart.slug !== current.slug)
  const previousUrl = previous?.post?.url
  const nextUrl = next?.post?.url

  return (
    <section
      className="not-prose mt-4 rounded-lg border border-border/70 bg-muted/40 p-4 text-sm shadow-sm transition-colors duration-200 hover:border-border"
      aria-label={`Series navigation for ${current.series.title}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Series
            <span aria-hidden="true" className="text-muted-foreground/60">•</span>
            <span>{`Part ${current.index + 1} of ${current.total}`}</span>
          </span>
          <div className="text-base font-medium leading-tight text-foreground">
            <Link
              href={current.series.url}
              className="underline-offset-4 transition hover:text-foreground/70 hover:underline"
            >
              {current.series.title}
            </Link>
          </div>
          {current.summary ? (
            <p className="text-xs text-muted-foreground">{current.summary}</p>
          ) : null}
          {showNudge && startPart?.post ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/90">
              <span className="font-medium text-foreground/70">New here?</span>
              <Link
                href={startPart.post.url}
                className="inline-flex items-center gap-1 underline-offset-4 transition hover:text-foreground"
              >
                Start at Part 1
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-foreground/70 sm:justify-end">
          {previous && previousUrl ? (
            <Link
              href={previousUrl}
              className="inline-flex items-center gap-1 rounded-md border border-border/70 px-2 py-1 transition hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-background/80"
              aria-label={`Previous: ${previous.title}`}
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" />
              <span>Previous</span>
            </Link>
          ) : null}
          <Link
            href={current.series.url}
            className="inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-muted-foreground underline-offset-4 transition hover:-translate-y-0.5 hover:text-foreground hover:underline"
            aria-label={`View all parts in ${current.series.title}`}
          >
            View all in this series
          </Link>
          {next && nextUrl ? (
            <Link
              href={nextUrl}
              className="inline-flex items-center gap-1 rounded-md border border-border/70 px-2 py-1 transition hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-background/80"
              aria-label={`Next: ${next.title}`}
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </nav>
      </div>
    </section>
  )
}

interface SeriesPartsListProps {
  seriesData: SeriesResolved
  currentSlug?: string
  size?: 'desktop' | 'mobile'
}

function SeriesPartsList({ seriesData, currentSlug, size = 'desktop' }: SeriesPartsListProps) {
  const { parts } = seriesData
  const itemBase =
    size === 'desktop'
      ? 'rounded-md border border-transparent px-3 py-2 text-sm transition'
      : 'rounded-md border border-transparent px-3 py-2 text-sm transition'

  return (
    <ol className="space-y-2">
      {parts.map((part) => {
        const isActive = part.slug === currentSlug
        const isLink = part.post && !part.isComingSoon
        const label = `Part ${part.index + 1}`
        const reading = part.readingMinutes ?? part.manualReadingMinutes

        const content = (
          <div
            className={cn(
              itemBase,
              'bg-background/60',
              isActive
                ? 'border-foreground/60 shadow-sm'
                : 'hover:-translate-y-0.5 hover:border-border hover:bg-background'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </span>
                <div className="mt-1 text-sm font-medium text-foreground">{part.title}</div>
                {part.summary ? (
                  <p className="mt-1 text-xs text-muted-foreground">{part.summary}</p>
                ) : null}
              </div>
              <div className="flex flex-col items-end gap-1">
                {reading ? (
                  <span className="text-xs text-muted-foreground">{reading} min</span>
                ) : null}
                {part.isComingSoon ? (
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                    Coming soon
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        )

        return (
          <li key={part.slug}>
            {isLink ? (
              <Link href={part.post!.url} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        )
      })}
    </ol>
  )
}

export function SeriesPartsDesktop({ seriesData, currentSlug }: Omit<SeriesPartsListProps, 'size'>) {
  return (
    <section className="not-prose">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Series parts</h2>
      <div className="mt-3">
        <SeriesPartsList seriesData={seriesData} currentSlug={currentSlug} size="desktop" />
      </div>
    </section>
  )
}

export function SeriesPartsMobile({ seriesData, currentSlug }: Omit<SeriesPartsListProps, 'size'>) {
  return (
    <div className="not-prose my-6 lg:hidden">
      <details className="group rounded-md border border-border/70 bg-muted/40 p-4">
        <summary className="flex cursor-pointer select-none items-center justify-between text-sm font-medium text-muted-foreground outline-none">
          <span>Show series parts</span>
          <ChevronDown
            className="size-4 transition-transform duration-200 group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="mt-3 space-y-3">
          <SeriesPartsList seriesData={seriesData} currentSlug={currentSlug} size="mobile" />
        </div>
      </details>
    </div>
  )
}
