import type { Metadata } from 'next'
import { allPosts } from 'contentlayer/generated'
import { PostsList } from '@/components/blog/PostsList'
import { absoluteUrl } from '@/lib/seo'

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
      <h1 className="text-3xl font-semibold">Blog</h1>
      <PostsList posts={posts} />
    </div>
  )
}
