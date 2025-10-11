import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { allPosts } from 'contentlayer/generated'
import { Mdx } from '@/components/mdx/mdx-client'
import { Badge } from '@/components/ui/badge'
import { absoluteUrl } from '@/lib/seo'
import { slugifyTag } from '@/lib/utils'

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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: absoluteUrl(`/blog/${post.slug}`),
  }

  return (
    <article className="prose">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <h1>{post.title}</h1>
      <p className="text-sm !mt-0 !mb-6 text-muted-foreground">
        {new Date(post.date).toLocaleDateString()}
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
      <Mdx code={post.body.code} />
    </article>
  )
}
