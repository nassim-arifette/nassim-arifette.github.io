import type { Metadata } from 'next'
import Link from 'next/link'
import { PostList } from '@/components/post-list'
import { listSeries } from '@/lib/series'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getPublishedPosts } from '@/lib/content'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Notes',
  description: 'Research notes, mathematical readings, and engineering write-ups.',
  path: '/blog',
  noIndex: getPublishedPosts().length === 0,
  ogImage: getOgImageUrl(),
})

export default function BlogIndex() {
  const posts = getPublishedPosts()
  // A series is listed once, as its table of contents, instead of one entry per part.
  const series = listSeries().filter((entry) => entry.publishedParts.length > 0)
  const inSeries = new Set(series.flatMap((entry) => entry.publishedParts.map((part) => part.slug)))
  const notes = posts.filter((post) => !inSeries.has(post.slug))

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${site.name} - Notes`,
    url: absoluteUrl('/blog'),
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: absoluteUrl(post.url),
    })),
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
      <p className="mt-2 text-muted-foreground">
        Longer explanations, mathematical readings, and implementation notes.
      </p>
      {series.map(({ series: info, parts, startPart }) => (
        <section key={info.slug} className="mt-8 border-y border-border py-5" aria-labelledby={`series-${info.slug}`}>
          <p className="text-sm text-muted-foreground">Series</p>
          <h2 id={`series-${info.slug}`} className="mt-1 text-lg font-medium leading-snug">
            {startPart?.post ? (
              <Link href={startPart.post.url} className="hover:text-accent">
                {info.title}
              </Link>
            ) : (
              info.title
            )}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{info.description}</p>
          <ol className="mt-4 space-y-1.5 text-sm">
            {parts.map((part) => (
              <li key={part.slug} className="grid grid-cols-[5.5rem_1fr] gap-3">
                <span className="tabular-nums text-muted-foreground">{part.label ?? `Part ${part.index + 1}`}</span>
                {part.post ? (
                  <Link href={part.post.url} className="hover:text-accent">
                    {part.title}
                  </Link>
                ) : (
                  <span className="text-muted-foreground/70">{part.title}</span>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
      <div className="mt-8">
        <PostList posts={notes} />
      </div>
    </div>
  )
}
