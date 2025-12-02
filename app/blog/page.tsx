import Link from 'next/link'
import type { Metadata } from 'next'
import { allPosts } from 'contentlayer/generated'
import { PostsList } from '@/components/blog/PostsList'
import { absoluteUrl } from '@/lib/seo'
import { getSeriesPartForPostSlug, listSeries } from '@/lib/series'

export const metadata: Metadata = {
  title: 'Blog — Nassim Arifette',
  description: 'Analyses, research notes, and engineering write-ups from Nassim Arifette.',
  alternates: {
    canonical: absoluteUrl('/blog'),
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/blog'),
    title: 'Blog — Nassim Arifette',
    description: 'Read research notes, implementation guides, and engineering write-ups from Nassim Arifette.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Nassim Arifette',
    description: 'Research notes and engineering write-ups from Nassim Arifette.',
  },
}

export default function BlogIndex() {
  const posts = [...allPosts]
    .filter((p) => p.published !== false)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  const seriesList = listSeries()

  const seriesInfo = posts.reduce<Record<string, { seriesTitle: string; seriesSlug: string; index: number; total: number }>>(
    (acc, post) => {
      const part = getSeriesPartForPostSlug(post.slug)
      if (part) {
        acc[post.slug] = {
          seriesTitle: part.series.title,
          seriesSlug: part.series.slug,
          index: part.index,
          total: part.total,
        }
      }
      return acc
    },
    {},
  )

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Nassim Arifette — Blog',
    url: absoluteUrl('/blog'),
    about: 'Research notes and engineering write-ups from Nassim Arifette.',
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: absoluteUrl(post.url),
    })),
  }

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold">Blog</h1>
          <PostsList posts={posts} seriesInfo={seriesInfo} />
        </div>
        <aside className="space-y-4 self-start lg:sticky lg:top-24">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Series</h2>
            <p className="text-sm text-muted-foreground">Follow related posts in order.</p>
          </div>
          <div className="space-y-3">
            {seriesList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No series yet.</p>
            ) : (
              seriesList.map(({ series, parts, startPart }) => (
                <Link
                  key={series.slug}
                  href={series.url}
                  className="block rounded-lg border border-border/70 bg-card p-4 transition hover:-translate-y-1 hover:border-foreground/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold leading-snug text-foreground">{series.title}</span>
                    <span className="text-xs text-muted-foreground">{parts.length} parts</span>
                  </div>
                  {series.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{series.description}</p>
                  ) : null}
                  {startPart ? (
                    <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary/70">
                      {startPart.post ? `Start with ${startPart.title}` : 'Coming soon'}
                    </span>
                  ) : null}
                </Link>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
