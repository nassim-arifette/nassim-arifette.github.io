import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostCard } from '@/components/cards/PostCard'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { getTagAggregate, getTagAggregates } from '@/lib/tags'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { absoluteUrl } from '@/lib/seo'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  return getTagAggregates().map((tag) => ({ slug: tag.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const tag = getTagAggregate(params.slug)
  if (!tag) return {}

  const description = `Posts and projects tagged "${tag.tag}".`

  return buildMetadata({
    title: `${tag.tag} - Tag`,
    description,
    path: `/tags/${tag.slug}`,
    ogImage: getOgImageUrl(tag.slug),
    tags: [tag.tag],
  })
}

export default function TagDetailPage({ params }: PageProps) {
  const tag = getTagAggregate(params.slug)
  if (!tag) return notFound()

  const description = `Posts and projects tagged "${tag.tag}".`
  const totalItems = tag.posts.length + tag.projects.length

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tag.tag} tag`,
    description,
    url: absoluteUrl(`/tags/${tag.slug}`),
    hasPart: [
      ...tag.posts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        url: absoluteUrl(post.url),
      })),
      ...tag.projects.map((project) => ({
        '@type': 'CreativeWork',
        name: project.title,
        description: project.description,
        datePublished: project.date,
        url: absoluteUrl(project.url),
      })),
    ],
  }

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Link href="/tags" className="underline-offset-4 hover:underline">
            All tags
          </Link>
          <span aria-hidden="true" className="text-muted-foreground/60">
            |
          </span>
          <span>{totalItems} items</span>
        </div>
        <h1 className="text-3xl font-semibold">#{tag.tag}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </header>

      {tag.posts.length === 0 && tag.projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items tagged yet.</p>
      ) : null}

      {tag.posts.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Posts</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {tag.posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {tag.projects.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Projects</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tag.projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
