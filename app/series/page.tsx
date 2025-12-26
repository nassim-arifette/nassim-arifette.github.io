import type { Metadata } from 'next'
import Link from 'next/link'
import { listSeries } from '@/lib/series'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Series',
  description: 'Multi-part deep dives and guided learning tracks.',
  path: '/series',
  ogImage: getOgImageUrl(),
})

function formatParts(count: number) {
  return `${count} part${count === 1 ? '' : 's'}`
}

export default function SeriesIndexPage() {
  const seriesList = listSeries()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Series',
    itemListElement: seriesList.map(({ series }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: series.title,
      url: absoluteUrl(series.url),
      description: series.description,
    })),
  }

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Series</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Multi-part writing tracks that connect related posts in order.
        </p>
      </header>

      {seriesList.length === 0 ? (
        <p className="text-sm text-muted-foreground">No series published yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {seriesList.map(({ series, parts, startPart, publishedParts }) => (
            <Link
              key={series.slug}
              href={series.url}
              className="group rounded-lg border border-border/70 bg-card p-5 transition hover:-translate-y-1 hover:border-foreground/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold leading-tight">{series.title}</h2>
                <span className="text-xs text-muted-foreground">
                  {formatParts(parts.length)}
                </span>
              </div>
              {series.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{series.description}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-0.5">Series</span>
                <span>{publishedParts.length} published</span>
                {startPart?.post ? (
                  <span className="rounded-full border border-dashed border-border px-2 py-0.5">
                    Start with {startPart.title}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
