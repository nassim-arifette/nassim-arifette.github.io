import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Github, ExternalLink, FileText, FileDown } from 'lucide-react'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { Mdx } from '@/components/mdx/mdx-client'
import { formatDate } from '@/lib/mdx'
import { getOgImageUrl } from '@/lib/og'
import { TableOfContents } from '@/components/mdx/table-of-contents'
import type { TocHeading } from '@/components/mdx/table-of-contents'
import { buildMetadata } from '@/lib/metadata'
import { getAllProjects, getProjectBySlug } from '@/lib/content'
import { getRelatedByTags } from '@/lib/related'
import { TagLink } from '@/components/tags/TagLink'
import { absoluteUrl } from '@/lib/seo'

interface PageProps {
  params: { slug: string }
}

const linkConfig = {
  github: { label: 'GitHub', Icon: Github },
  website: { label: 'Website', Icon: ExternalLink },
  demo: { label: 'Demo', Icon: ExternalLink },
  paper: { label: 'Paper', Icon: FileText },
  pdf: { label: 'PDF', Icon: FileDown },
} as const

const MAX_RELATED_PROJECTS = 3

export async function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const project = getProjectBySlug(params.slug)
  if (!project) return {}
  const ogImage = getOgImageUrl(project.slug)

  return {
    ...buildMetadata({
      title: project.title,
      description: project.description,
      path: `/projects/${project.slug}`,
      ogImage,
      type: 'article',
      publishedTime: project.date,
      modifiedTime: project.date,
      tags: project.tags,
    }),
    authors: [{ name: 'Nassim Arifette', url: absoluteUrl('/') }],
  }
}

export default function ProjectPage({ params }: PageProps) {
  const project = getProjectBySlug(params.slug)
  if (!project) return notFound()

  const relatedProjects = getRelatedByTags(project, getAllProjects(), MAX_RELATED_PROJECTS)
  const ogImage = getOgImageUrl(project.slug)

  const linkEntries = Object.entries(project.links ?? {}) as Array<[
    keyof typeof linkConfig,
    string,
  ]>

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: project.title,
    name: project.title,
    description: project.description,
    url: absoluteUrl(`/projects/${project.slug}`),
    datePublished: project.date,
    dateModified: project.date,
    mainEntityOfPage: absoluteUrl(`/projects/${project.slug}`),
    author: {
      '@type': 'Person',
      name: 'Nassim Arifette',
      url: absoluteUrl('/'),
    },
    image: [ogImage],
    keywords: project.tags,
  }

  const headings = (project.headings ?? []) as TocHeading[]

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(220px,1fr)] lg:gap-12 print:block">
      <article className="prose max-w-none">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <header className="not-prose space-y-4">
          <p className="text-sm text-muted-foreground">{formatDate(project.date)}</p>
          <h1 className="text-3xl font-semibold leading-tight">{project.title}</h1>
          <p className="max-w-2xl text-base text-muted-foreground">{project.description}</p>
          {project.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <TagLink
                  key={tag}
                  tag={tag}
                  showHash
                  variant="secondary"
                  className="transition hover:text-foreground"
                />
              ))}
            </div>
          ) : null}
          {linkEntries.length ? (
            <div className="flex flex-wrap gap-3 text-sm">
              {linkEntries.map(([key, href]) => {
                const entry = linkConfig[key]
                if (!entry) return null
                const { Icon, label } = entry
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-foreground/80"
                  >
                    <Icon size={16} /> {label}
                  </a>
                )
              })}
            </div>
          ) : null}
        </header>
        {headings.length ? (
          <div className="not-prose my-8 lg:hidden print:hidden">
            <TableOfContents headings={headings} />
          </div>
        ) : null}
        <Mdx code={project.body.code} />
        {relatedProjects.length ? (
          <section className="not-prose mt-12 space-y-4 print:hidden">
            <h2 className="text-xl font-semibold">Related projects</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedProjects.map((related) => (
                <ProjectCard key={related.slug} project={related} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
      {headings.length ? (
        <aside className="relative hidden lg:block print:hidden">
          <TableOfContents headings={headings} className="sticky top-24" />
        </aside>
      ) : null}
    </div>
  )
}
