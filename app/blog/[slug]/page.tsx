import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { allPosts } from 'contentlayer/generated'
import { Mdx } from '@/components/mdx/mdx-client'
import { Badge } from '@/components/ui/badge'
import { absoluteUrl } from '@/lib/seo'
import { slugifyTag } from '@/lib/utils'
import { TableOfContents } from '@/components/mdx/table-of-contents'
import type { TocHeading } from '@/components/mdx/table-of-contents'
import { ReadingProgressBar } from '@/components/blog/reading-progress-bar'

interface PageProps { params: { slug: string } }

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

  const wordCount = post.body?.raw?.match(/\S+/g)?.length ?? 0
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))
  const formattedDate = new Date(post.date).toLocaleDateString()

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
      <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(220px,1fr)] lg:gap-12">
        <article className="prose">
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
          {headings.length ? (
            <div className="not-prose my-8 lg:hidden">
              <TableOfContents headings={headings} />
            </div>
          ) : null}
          <Mdx code={post.body.code} />
        </article>
        {headings.length ? (
          <aside className="relative hidden lg:block">
            <TableOfContents headings={headings} className="sticky top-24" />
          </aside>
        ) : null}
      </div>
    </>
  )
}
