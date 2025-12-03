import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { allProjects } from 'contentlayer/generated'
import type { Project } from 'contentlayer/generated'
import { Github, ExternalLink, FileText, FileDown } from 'lucide-react'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { Mdx } from '@/components/mdx/mdx-client'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/mdx'
import { absoluteUrl } from '@/lib/seo'
import { getOgImageUrl } from '@/lib/og'
import { TableOfContents } from '@/components/mdx/table-of-contents'
import type { TocHeading } from '@/components/mdx/table-of-contents'

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

function getRelatedProjects(current: Project) {
  if (!current.tags?.length) return []

  const currentTags = new Set(current.tags.map((tag) => tag.trim()).filter(Boolean))
  if (currentTags.size === 0) return []

  return allProjects
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => {
      const candidateTags = new Set((candidate.tags ?? []).map((tag) => tag.trim()).filter(Boolean))
      let overlap = 0
      for (const tag of candidateTags) {
        if (currentTags.has(tag)) {
          overlap += 1
        }
      }
      return { candidate, overlap }
    })
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap
      const dateDiff = +new Date(b.candidate.date) - +new Date(a.candidate.date)
      if (dateDiff !== 0) return dateDiff
      return a.candidate.title.localeCompare(b.candidate.title)
    })
    .slice(0, MAX_RELATED_PROJECTS)
    .map(({ candidate }) => candidate)
}

export async function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const project = allProjects.find((p) => p.slug === params.slug)
  if (!project) return {}
  const ogImage = getOgImageUrl(project.slug)

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: absoluteUrl(`/projects/${project.slug}`),
    },
    openGraph: {
      type: 'article',
      url: absoluteUrl(`/projects/${project.slug}`),
      title: project.title,
      description: project.description,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [ogImage],
    },
  }
}

export default function ProjectPage({ params }: PageProps) {
  const project = allProjects.find((p) => p.slug === params.slug)
  if (!project) return notFound()

  const relatedProjects = getRelatedProjects(project)
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
                <Badge key={tag} variant="secondary" className="cursor-default">
                  #{tag}
                </Badge>
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
