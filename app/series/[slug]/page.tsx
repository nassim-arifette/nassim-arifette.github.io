import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { formatDate } from '@/lib/mdx'
import { findSeriesBySlug, listSeries } from '@/lib/series'
import { SeriesContinueButton } from '@/components/series/SeriesContinueButton'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  return listSeries().map(({ series }) => ({ slug: series.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const seriesData = findSeriesBySlug(params.slug)
  if (!seriesData) return {}

  return {
    title: `${seriesData.series.title} — Series`,
    description: seriesData.series.description,
    alternates: {
      canonical: absoluteUrl(seriesData.series.url),
    },
    openGraph: {
      type: 'website',
      url: absoluteUrl(seriesData.series.url),
      title: `${seriesData.series.title} — Series`,
      description: seriesData.series.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seriesData.series.title} — Series`,
      description: seriesData.series.description,
    },
  }
}

export default function SeriesDetailPage({ params }: PageProps) {
  const seriesData = findSeriesBySlug(params.slug)
  if (!seriesData) return notFound()

  const { series, parts, startPart, publishedParts } = seriesData
  const startUrl = startPart?.post?.url
  const continueParts = publishedParts
    .filter((part) => part.post)
    .map((part) => ({
      slug: part.post!.slug,
      title: part.title,
      index: part.index,
      url: part.post!.url,
    }))

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Series
          <span aria-hidden="true" className="text-muted-foreground/60">•</span>
          <span>{parts.length} parts</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{series.title}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{series.description}</p>
          {series.heroNote ? (
            <p className="max-w-2xl text-sm text-muted-foreground/80">{series.heroNote}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {startUrl ? (
            <Link
              href={startUrl}
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Start series
            </Link>
          ) : null}
          <SeriesContinueButton seriesSlug={series.slug} parts={continueParts} />
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground/80">Parts</h2>
        <ol className="space-y-4">
          {parts.map((part) => {
            const partNumber = part.index + 1
            const isAvailable = Boolean(part.post && !part.isComingSoon)
            const reading = part.readingMinutes ?? part.manualReadingMinutes

            if (isAvailable && part.post) {
              return (
                <li key={part.slug} className="group">
                  <Link
                    href={part.post.url}
                    className="block rounded-lg border border-border/70 bg-background/70 p-5 transition hover:-translate-y-1 hover:border-foreground/50 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Part {partNumber}
                        </span>
                        <h3 className="mt-2 text-lg font-medium text-foreground group-hover:underline">
                          {part.title}
                        </h3>
                        {part.summary ? (
                          <p className="mt-2 text-sm text-muted-foreground">{part.summary}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground sm:items-end">
                        {part.post.date ? (
                          <time dateTime={part.post.date}>{formatDate(part.post.date)}</time>
                        ) : null}
                        {reading ? <span>{reading} min</span> : null}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            }

            return (
              <li key={part.slug}>
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
                        Part {partNumber}
                      </span>
                      <h3 className="mt-2 text-lg font-medium text-foreground/70">{part.title}</h3>
                      {part.summary ? (
                        <p className="mt-2 text-sm text-muted-foreground/90">{part.summary}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground sm:items-end">
                      {reading ? <span>~{reading} min</span> : null}
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                        Coming soon
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
