import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostCard } from '@/components/cards/PostCard'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { getTagAggregate, getTagAggregates } from '@/lib/tags'
import { absoluteUrl } from '@/lib/seo'

type TagPageProps = {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return getTagAggregates().map((aggregate) => ({ slug: aggregate.slug }))
}

export function generateMetadata({ params }: TagPageProps): Metadata {
  const aggregate = getTagAggregate(params.slug)
  if (!aggregate) {
    return {
      title: 'Tag not found',
    }
  }

  const { tag } = aggregate
  const title = `${tag} — Tagged Content`
  const description = `Posts and projects related to “${tag}” by Nassim Arifette.`
  const canonical = absoluteUrl(`/tags/${aggregate.slug}`)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function TagPage({ params }: TagPageProps) {
  const aggregate = getTagAggregate(params.slug)
  if (!aggregate) {
    notFound()
  }

  const { tag, posts, projects } = aggregate
  const totalCount = posts.length + projects.length
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tag} — Tagged Content`,
    url: absoluteUrl(`/tags/${aggregate.slug}`),
    about: tag,
    hasPart: [
      ...posts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        datePublished: post.date,
        description: post.description,
        url: absoluteUrl(post.url),
      })),
      ...projects.map((project) => ({
        '@type': 'CreativeWork',
        headline: project.title,
        datePublished: project.date,
        description: project.description,
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
      <div className="space-y-3">
        <Link
          href="/tags"
          className="inline-flex items-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← All tags
        </Link>
        <h1 className="text-3xl font-semibold">#{tag}</h1>
        <p className="text-muted-foreground text-sm">
          {totalCount} item{totalCount === 1 ? '' : 's'} tagged “{tag}”.
        </p>
      </div>

      {posts.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Related Posts</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Related Projects</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} idAnchor />
            ))}
          </div>
        </section>
      ) : null}

      {posts.length === 0 && projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No content found for this tag yet.</p>
      ) : null}
    </div>
  )
}
