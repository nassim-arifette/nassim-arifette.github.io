import type { Metadata } from 'next'
import Link from 'next/link'
import { getTagAggregates } from '@/lib/tags'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'

export const metadata: Metadata = buildMetadata({
  title: 'Tags',
  description: 'Browse posts and projects by topic.',
  path: '/tags',
  ogImage: getOgImageUrl(),
})

function formatCount(count: number, label: string) {
  return `${count} ${label}${count === 1 ? '' : 's'}`
}

export default function TagsPage() {
  const tags = getTagAggregates()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tags',
    itemListElement: tags.map((tag, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tag.tag,
      url: absoluteUrl(`/tags/${tag.slug}`),
    })),
  }

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Tags</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Browse posts and projects by topic.
        </p>
      </header>

      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tags available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              prefetch={false}
              className="group rounded-lg border border-border/70 bg-card p-4 transition hover:-translate-y-1 hover:border-foreground/50 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-medium">{tag.tag}</span>
                <span className="text-xs text-muted-foreground">
                  {tag.posts.length + tag.projects.length}
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {formatCount(tag.posts.length, 'post')} / {formatCount(tag.projects.length, 'project')}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
