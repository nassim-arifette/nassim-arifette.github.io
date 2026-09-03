import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Mdx } from '@/components/mdx/mdx-client'
import { TableOfContents } from '@/components/mdx/table-of-contents'
import type { TocHeading } from '@/components/mdx/table-of-contents'
import { getOgImageUrl } from '@/lib/og'
import { formatDate, getReadingStats } from '@/lib/mdx'
import { getSeriesNavigation } from '@/lib/series'
import { buildMetadata } from '@/lib/metadata'
import { getAllPosts, getPublishedPostBySlug } from '@/lib/content'
import { absoluteUrl } from '@/lib/seo'
import { site } from '@/lib/site'

interface PageProps {
  params: { slug: string[] }
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug.split('/') }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const slug = params.slug.join('/')
  const post = getPublishedPostBySlug(slug)
  if (!post) return {}

  return {
    ...buildMetadata({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      ogImage: getOgImageUrl(post.slug),
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.date,
      tags: post.tags,
    }),
    authors: [{ name: site.name, url: absoluteUrl('/') }],
  }
}

export default function PostPage({ params }: PageProps) {
  const slug = params.slug.join('/')
  const post = getPublishedPostBySlug(slug)
  if (!post) return notFound()

  const readingMinutes = getReadingStats(post.body?.raw).minutes ?? 1
  const series = getSeriesNavigation(post.slug)
  const headings = (post.headings ?? []) as TocHeading[]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: absoluteUrl(`/blog/${post.slug}`),
    author: { '@type': 'Person', name: site.name, url: absoluteUrl('/') },
    image: [getOgImageUrl(post.slug)],
    keywords: post.tags,
  }

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <header className="mb-10 border-b border-border pb-8">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          ← Notes
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{post.title}</h1>
        <p className="mt-3 text-muted-foreground">{post.description}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes} min read
          {series ? (
            <>
              {' '}
              · Part {series.current.index + 1} of {series.current.total} in “{series.current.series.title}”
            </>
          ) : null}
        </p>
      </header>

      <div className="prose">
        <TableOfContents headings={headings} />
        <Mdx code={post.body.code} />
      </div>

      {series && (series.previous?.post || series.next?.post) ? (
        <nav aria-label="Series navigation" className="mt-12 flex justify-between gap-6 border-t border-border pt-6 text-sm">
          {series.previous?.post ? (
            <Link href={series.previous.post.url} className="link">
              ← {series.previous.title}
            </Link>
          ) : (
            <span />
          )}
          {series.next?.post ? (
            <Link href={series.next.post.url} className="link text-right">
              {series.next.title} →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </article>
  )
}
