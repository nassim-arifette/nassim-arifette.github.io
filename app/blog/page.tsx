import type { Metadata } from 'next'
import { PostList } from '@/components/post-list'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getPublishedPosts } from '@/lib/content'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Notes',
  description: 'Research notes, mathematical readings, and engineering write-ups.',
  path: '/blog',
  ogImage: getOgImageUrl(),
})

export default function BlogIndex() {
  const posts = getPublishedPosts()

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
      <div className="mt-8">
        <PostList posts={posts} />
      </div>
    </div>
  )
}
