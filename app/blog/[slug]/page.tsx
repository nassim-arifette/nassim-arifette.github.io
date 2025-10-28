import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { allPosts } from 'contentlayer/generated'
import type { Post } from 'contentlayer/generated'
import { Mdx } from '@/components/mdx/mdx-client'
import { Badge } from '@/components/ui/badge'
import { absoluteUrl } from '@/lib/seo'
import { slugifyTag } from '@/lib/utils'
import { TableOfContents } from '@/components/mdx/table-of-contents'
import type { TocHeading } from '@/components/mdx/table-of-contents'
import { ReadingProgressBar } from '@/components/blog/reading-progress-bar'
import { formatDate, getReadingStats } from '@/lib/mdx'
import { findSeriesBySlug, getSeriesNavigation } from '@/lib/series'
import { SeriesBanner, SeriesPartsDesktop, SeriesPartsMobile } from '@/components/series/SeriesNavigation'
import { SeriesProgressRecorder } from '@/components/series/SeriesProgressRecorder'

interface PageProps { params: { slug: string } }

const MAX_RELATED_POSTS = 3

function getRelatedPosts(current: Post) {
  const currentTags = new Set((current.tags ?? []).map((tag) => tag.trim()).filter(Boolean))
  if (currentTags.size === 0) return []

  return allPosts
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => {
      const candidateTags = new Set((candidate.tags ?? []).map((tag) => tag.trim()).filter(Boolean))
      let overlap = 0
      for (const tag of candidateTags) {
        if (currentTags.has(tag)) {
          overlap += 1
        }
      }
      return { candidate, overlap }
    })
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap
      const dateDiff = +new Date(b.candidate.date) - +new Date(a.candidate.date)
      if (dateDiff !== 0) return dateDiff
      return a.candidate.title.localeCompare(b.candidate.title)
    })
    .slice(0, MAX_RELATED_POSTS)
    .map(({ candidate }) => candidate)
}

export async function generateStaticParams() {
  return allPosts.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = allPosts.find((p) => p.slug === params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: absoluteUrl(`/blog/${post.slug}`),
    },
    openGraph: {
      type: 'article',
      url: absoluteUrl(`/blog/${post.slug}`),
      title: post.title,
      description: post.description,
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default function PostPage({ params }: PageProps) {
  const post = allPosts.find((p) => p.slug === params.slug)
  if (!post) return notFound()

  const readingStats = getReadingStats(post.body?.raw)
  const readingTimeMinutes = readingStats.minutes ?? 1
  const formattedDate = formatDate(post.date)
  const relatedPosts = getRelatedPosts(post)
  const seriesNavigation = getSeriesNavigation(post.slug)
  const seriesData = seriesNavigation ? findSeriesBySlug(seriesNavigation.current.series.slug) : undefined

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: absoluteUrl(`/blog/${post.slug}`),
  }

  const headings = (post.headings ?? []) as TocHeading[]

  return (
    <>
      <ReadingProgressBar />
      <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(220px,1fr)] lg:gap-12 print:block">
        <article className="prose print:max-w-none">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          <h1>{post.title}</h1>
          <p className="text-sm !mt-0 !mb-6 text-muted-foreground">
            <time dateTime={post.date}>{formattedDate}</time>
            <span aria-hidden="true" className="mx-1">|</span>
            <span>{readingTimeMinutes} min read</span>
          </p>
          {seriesNavigation && seriesData ? (
            <>
              <SeriesBanner navigation={seriesNavigation} seriesData={seriesData} />
              <SeriesProgressRecorder
                seriesSlug={seriesNavigation.current.series.slug}
                partSlug={post.slug}
              />
            </>
          ) : null}
          {post.tags?.length ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/tags/${slugifyTag(tag)}`} className="inline-flex">
                  <Badge variant="secondary" className="transition hover:bg-foreground hover:text-background">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : null}
          {seriesNavigation && seriesData ? (
            <SeriesPartsMobile seriesData={seriesData} currentSlug={post.slug} />
          ) : null}
          {headings.length ? (
            <div className="not-prose my-8 lg:hidden print:hidden">
              <TableOfContents headings={headings} />
            </div>
          ) : null}
          <Mdx code={post.body.code} />
          {relatedPosts.length ? (
            <section className="not-prose mt-12 space-y-4">
              <h2 className="text-xl font-semibold">Related posts</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={related.url}
                    className="group block rounded-lg border bg-card p-5 transition duration-200 ease-out hover:-translate-y-1 hover:border-foreground/40 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-medium leading-tight group-hover:underline">
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
                    <span className="mt-4 inline-flex items-center text-xs font-medium text-primary/70">
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
            <div className="sticky top-24 space-y-6">
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
