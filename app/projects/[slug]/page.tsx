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
    <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(220px,1fr)] lg:gap-14 print:block">
      <article className="prose max-w-none">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <header className="not-prose mb-14 border-b border-border/70 pb-10 pt-3">
          <Link href="/projects" className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"><ArrowLeft size={15} /> Project index</Link>
          <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span className="text-[hsl(var(--signal))]">Case study</span><span aria-hidden="true">·</span><time dateTime={project.date}>{formatDate(project.date)}</time>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.75rem,6vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.055em]">{project.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">{project.description}</p>
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
                    className="group inline-flex min-h-11 items-center gap-2 border border-border bg-background px-4 font-semibold text-foreground transition hover:border-foreground"
                  >
                    <Icon size={16} /> {label}<ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
          <section className="not-prose mt-20 space-y-6 border-t border-border/70 pt-10 print:hidden">
            <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--signal))]">Continue exploring</p><h2 className="text-2xl font-semibold tracking-[-0.03em]">Related projects</h2></div>
            <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
              {relatedProjects.map((related, index) => (
                <ProjectCard key={related.slug} project={related} index={index + 1} />
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
