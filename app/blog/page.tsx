import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ArrowRight } from 'lucide-react'
import { PostsList } from '@/components/blog/PostsList'
import { getSeriesPartForPostSlug, listSeries } from '@/lib/series'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getPublishedPosts } from '@/lib/content'
import { getTagAggregates } from '@/lib/tags'
import { TagLink } from '@/components/tags/TagLink'
import { toPostListItem } from '@/lib/content-projections'

export const metadata: Metadata = buildMetadata({
  title: 'Research Notes',
  description: 'A searchable notebook of analyses, mathematical readings, experiments, and engineering write-ups from Nassim Arifette.',
  path: '/blog',
  ogImage: getOgImageUrl(),
})

export default function BlogIndex() {
  const posts = getPublishedPosts()

  const seriesList = listSeries()
  const tagHighlights = getTagAggregates()
    .filter((tag) => tag.posts.length > 0)
    .sort((a, b) => b.posts.length - a.posts.length || a.tag.localeCompare(b.tag))
    .slice(0, 12)

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
    name: 'Nassim Arifette - Research Notes',
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
    <div className="pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="grid border-b border-border pb-12 pt-3 lg:grid-cols-[3rem_minmax(0,1fr)] lg:gap-10 lg:pb-16 lg:pt-8">
        <div className="hidden border-r border-border pr-3 lg:block">
          <span className="block text-center font-serif text-lg text-signal">01</span>
          <span className="mx-auto mt-5 block h-16 w-px bg-border" aria-hidden="true" />
        </div>
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.55fr)] md:items-end">
          <div>
            <p className="manuscript-label text-signal">Notes · Derivations · Experiment logs</p>
            <h1 className="mt-5 max-w-[12ch] text-[clamp(3.4rem,7vw,6.6rem)] font-medium leading-[0.92] tracking-[-0.05em]">
              A research notebook, not a content feed.
            </h1>
          </div>
          <p className="max-w-[48ch] border-t border-border pt-5 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Longer explanations, implementation notes, and guided mathematical readings.
            Search by question, technique, or series and follow the reasoning in full.
          </p>
        </div>
      </header>

      <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(250px,0.3fr)] lg:pt-12">
        <section aria-label="Search and browse notes">
          <Suspense fallback={<p className="py-8 text-sm text-muted-foreground">Loading notes…</p>}>
            <PostsList posts={posts.map(toPostListItem)} seriesInfo={seriesInfo} />
          </Suspense>
        </section>
        <aside className="space-y-10 self-start border-t border-border pt-5 lg:sticky lg:top-24">
          {tagHighlights.length > 0 ? (
            <div className="space-y-3">
              <p className="manuscript-label">Index terms</p>
              <div className="flex flex-wrap gap-2">
                {tagHighlights.map((tag) => (
                  <TagLink
                    key={tag.slug}
                    tag={tag.tag}
                    variant="secondary"
                    className="transition hover:text-foreground"
                  />
                ))}
              </div>
              <Link href="/tags" className="editorial-link min-h-9 text-xs">
                View all index terms <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          ) : null}
          <div>
            <p className="manuscript-label">Guided series</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Follow related notes in order.</p>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {seriesList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No series yet.</p>
            ) : (
              seriesList.map(({ series, parts, startPart }) => (
                <Link
                  key={series.slug}
                  href={series.url}
                  className="group block py-4 transition-colors hover:text-signal"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold leading-snug text-foreground">{series.title}</span>
                    <span className="font-serif text-sm tabular-nums text-muted-foreground">{parts.length}</span>
                  </div>
                  {series.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{series.description}</p>
                  ) : null}
                  {startPart ? (
                    <span className="mt-3 inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-signal">
                      {startPart.post ? `Start with ${startPart.title}` : 'Coming soon'}
                    </span>
                  ) : null}
                </Link>
              ))
            )}
          </div>
          {seriesList.length > 0 ? (
            <Link href="/series" className="editorial-link min-h-9 text-xs">
              View all series <ArrowRight size={13} aria-hidden="true" />
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
