import type { Metadata } from 'next'
import Link from 'next/link'
import { getTagAggregates } from '@/lib/tags'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Tags — Nassim Arifette',
  description: 'Browse tags to explore related posts and projects on Nassim Arifette’s site.',
  alternates: {
    canonical: absoluteUrl('/tags'),
  },
  openGraph: {
    title: 'Tags — Nassim Arifette',
    description: 'Discover tags that group related posts and projects.',
    url: absoluteUrl('/tags'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tags — Nassim Arifette',
    description: 'Explore posts and projects by tag.',
  },
}

export default function TagsIndex() {
  const tags = getTagAggregates()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Tags</h1>
        <p className="text-sm text-muted-foreground">
          Jump directly to posts and projects that share the same focus area.
        </p>
      </div>
      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tags available yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => {
            const total = tag.posts.length + tag.projects.length
            const label = `#${tag.tag}`
            return (
              <li key={tag.slug}>
                <Link
                  href={`/tags/${tag.slug}`}
                  className="flex flex-col rounded-lg border border-border px-4 py-3 transition hover:-translate-y-1 hover:border-foreground/40 hover:shadow-md"
                >
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {total} item{total === 1 ? '' : 's'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
