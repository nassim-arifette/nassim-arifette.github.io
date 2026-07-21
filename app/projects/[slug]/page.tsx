import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Github, ExternalLink, FileText, FileDown } from 'lucide-react'
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
import { isProjectLinkReady } from '@/lib/project-links'

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
      type: 'website',
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

  const linkEntries = (Object.entries(project.links ?? {}) as Array<[
    keyof typeof linkConfig,
    string,
  ]>).filter(([, href]) => isProjectLinkReady(href))

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: project.title,
    name: project.title,
    description: project.description,
    url: absoluteUrl(`/projects/${project.slug}`),
    dateCreated: project.date,
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
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.28fr)] lg:gap-16 print:block">
      <article lang={project.language ?? 'en'} className="prose min-w-0 max-w-[78ch]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <header className="not-prose mb-14 border-b border-border pb-10 pt-3 sm:pb-12">
          <Link href="/projects" className="mb-10 inline-flex min-h-11 items-center gap-2 border-b border-transparent text-sm text-muted-foreground transition-colors hover:border-current hover:text-signal"><ArrowLeft size={15} aria-hidden="true" /> Project index</Link>
          <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span className="text-signal">Case study</span><span aria-hidden="true">·</span><time dateTime={project.date}>{formatDate(project.date)}</time>
          </div>
          <h1 className="max-w-[17ch] text-[clamp(2.8rem,6vw,5.6rem)] font-medium leading-[0.95] tracking-[-0.045em]">{project.title}</h1>
          <p className="mt-6 max-w-[64ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{project.description}</p>
          {project.tags?.length ? (
            <div className="mt-7 flex flex-wrap gap-2">
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
            <div className="mt-7 flex flex-wrap gap-2 text-sm">
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
                    className="group inline-flex min-h-11 items-center gap-2 border border-border bg-background px-4 font-semibold text-foreground transition-colors hover:border-signal hover:text-signal"
                  >
                    <Icon size={16} aria-hidden="true" /> {label}<ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          ) : null}
        </header>
        {headings.length ? (
          <div className="not-prose my-8 lg:hidden print:hidden">
            <TableOfContents headings={headings} defaultCollapsed />
          </div>
        ) : null}
        <Mdx code={project.body.code} />
        {relatedProjects.length ? (
          <section className="not-prose mt-20 space-y-6 border-t border-border/70 pt-10 print:hidden">
            <div><p className="manuscript-label mb-2 text-signal">Continue exploring</p><h2 className="text-3xl font-medium tracking-[-0.03em]">Related projects</h2></div>
            <div className="divide-y divide-border border-y border-border">
              {relatedProjects.map((related, index) => (
                <ProjectCard key={related.slug} project={related} index={index + 1} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
      {headings.length ? (
        <aside className="relative hidden lg:block print:hidden">
          <TableOfContents
            headings={headings}
            className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain pr-2"
          />
        </aside>
      ) : null}
    </div>
  )
}
