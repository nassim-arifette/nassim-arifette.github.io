import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Mdx } from '@/components/mdx/mdx-client'
import { Badge } from '@/components/ui/badge'
import { getOgImageUrl } from '@/lib/og'
import { TableOfContents } from '@/components/mdx/table-of-contents'
import type { TocHeading } from '@/components/mdx/table-of-contents'
import { ReadingProgressBar } from '@/components/blog/reading-progress-bar'
import { formatDate, getReadingStats } from '@/lib/mdx'
import { findSeriesBySlug, getSeriesNavigation } from '@/lib/series'
import { SeriesBanner, SeriesPartsDesktop, SeriesPartsMobile } from '@/components/series/SeriesNavigation'
import { SeriesProgressRecorder } from '@/components/series/SeriesProgressRecorder'
import { buildMetadata } from '@/lib/metadata'
import { getAllPosts, getPublishedPostBySlug, getPublishedPosts } from '@/lib/content'
import { getRelatedByTags } from '@/lib/related'
import { TagLink } from '@/components/tags/TagLink'
import { absoluteUrl } from '@/lib/seo'

interface PageProps { params: { slug: string[] } }

const MAX_RELATED_POSTS = 3

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug.split('/') }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const slug = params.slug.join('/')
  const post = getPublishedPostBySlug(slug)
  if (!post) return {}
  const ogImage = getOgImageUrl(post.slug)

  return {
    ...buildMetadata({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      ogImage,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.date,
      tags: post.tags,
    }),
    authors: [{ name: 'Nassim Arifette', url: absoluteUrl('/') }],
  }
}

export default function PostPage({ params }: PageProps) {
  const slug = params.slug.join('/')
  const post = getPublishedPostBySlug(slug)
  if (!post) return notFound()

  const image = getOgImageUrl(post.slug)
  const readingStats = getReadingStats(post.body?.raw)
  const readingTimeMinutes = readingStats.minutes ?? 1
  const formattedDate = formatDate(post.date)
  const relatedPosts = getRelatedByTags(post, getPublishedPosts(), MAX_RELATED_POSTS)
  const seriesNavigation = getSeriesNavigation(post.slug)
  const seriesData = seriesNavigation ? findSeriesBySlug(seriesNavigation.current.series.slug) : undefined

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: absoluteUrl(`/blog/${post.slug}`),
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    author: {
      '@type': 'Person',
      name: 'Nassim Arifette',
      url: absoluteUrl('/'),
    },
    publisher: {
      '@type': 'Person',
      name: 'Nassim Arifette',
      url: absoluteUrl('/'),
    },
    image: [image],
    keywords: post.tags,
  }

  const headings = (post.headings ?? []) as TocHeading[]

  return (
    <>
      <ReadingProgressBar targetId="post-article" />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.28fr)] lg:gap-16 print:block">
        <article id="post-article" className="prose min-w-0 max-w-[78ch] print:max-w-none">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          <header className="not-prose mb-10 border-b border-border pb-9 pt-3 sm:mb-12 sm:pb-11">
            <p className="manuscript-label text-signal">Research note</p>
            <h1 className="mt-5 max-w-[18ch] text-[clamp(2.8rem,6vw,5.5rem)] font-medium leading-[0.96] tracking-[-0.045em]">
              {post.title}
            </h1>
            <p className="mt-5 max-w-[65ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {post.description}
            </p>
            <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <time dateTime={post.date}>{formattedDate}</time>
              <span aria-hidden="true" className="mx-2">·</span>
              <span>{readingTimeMinutes} minute read</span>
            </p>
          </header>
          {seriesNavigation && seriesData ? (
            <div className="print:hidden">
              <SeriesBanner navigation={seriesNavigation} seriesData={seriesData} />
              <SeriesProgressRecorder
                seriesSlug={seriesNavigation.current.series.slug}
                partSlug={post.slug}
              />
            </div>
          ) : null}
          {post.tags?.length ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <TagLink
                  key={tag}
                  tag={tag}
                  showHash
                  variant="secondary"
                  className="transition hover:text-foreground"
                />
              ))}
            </div>
          ) : null}
          {seriesNavigation && seriesData ? (
            <div className="print:hidden">
              <SeriesPartsMobile seriesData={seriesData} currentSlug={post.slug} />
            </div>
          ) : null}
          {headings.length ? (
            <div className="not-prose my-8 lg:hidden print:hidden">
              <TableOfContents headings={headings} defaultCollapsed />
            </div>
          ) : null}
          <Mdx code={post.body.code} />
          {relatedPosts.length ? (
            <section className="not-prose mt-16 space-y-5 border-t border-border pt-9 print:hidden">
              <div>
                <p className="manuscript-label text-signal">Continue reading</p>
                <h2 className="mt-2 text-3xl font-medium">Related notes</h2>
              </div>
              <div className="divide-y divide-border border-y border-border">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={related.url}
                    className="group block py-5 transition-colors hover:text-signal"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-medium leading-tight group-hover:underline">
                        {related.title}
                      </h3>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(related.date)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{related.description}</p>
                    {related.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {related.tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.1em] text-signal">
                      Continue reading →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>
        {(seriesNavigation && seriesData) || headings.length ? (
          <aside className="relative hidden lg:block print:hidden">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-6 overflow-y-auto overscroll-contain pr-2">
              {seriesNavigation && seriesData ? (
                <SeriesPartsDesktop seriesData={seriesData} currentSlug={post.slug} />
              ) : null}
              {headings.length ? <TableOfContents headings={headings} /> : null}
            </div>
          </aside>
        ) : null}
      </div>
    </>
  )
}
