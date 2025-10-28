import Link from 'next/link'
import type { Metadata } from 'next'
import { listSeries } from '@/lib/series'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Series — Nassim Arifette',
  description: 'Lightweight collections of related posts so you can follow the story in order.',
  alternates: {
    canonical: absoluteUrl('/series'),
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/series'),
    title: 'Series — Nassim Arifette',
    description: 'Follow curated threads of related posts in order.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Series — Nassim Arifette',
    description: 'Follow curated threads of related posts in order.',
  },
}

export default function SeriesIndexPage() {
  const seriesList = listSeries()

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Series</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          A quiet way to follow related posts without losing the plot. Each series keeps the parts in order and
          remembers where you left off.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {seriesList.map(({ series, parts, startPart }) => (
          <Link
            key={series.slug}
            href={series.url}
            className="group flex h-full flex-col justify-between rounded-lg border border-border/70 bg-card p-5 transition hover:-translate-y-1 hover:border-foreground/40 hover:shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-medium leading-snug text-foreground group-hover:underline">
                  {series.title}
                </h2>
                <span className="text-xs text-muted-foreground">{parts.length} parts</span>
              </div>
              <p className="text-sm text-muted-foreground">{series.description}</p>
            </div>
            {startPart?.post ? (
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary/70">
                Start with {startPart.title}
              </span>
            ) : (
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
                First installment coming soon
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
