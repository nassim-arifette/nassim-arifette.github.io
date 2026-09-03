import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Mdx } from '@/components/mdx/mdx-client'
import { TableOfContents } from '@/components/mdx/table-of-contents'
import type { TocHeading } from '@/components/mdx/table-of-contents'
import { formatDate } from '@/lib/mdx'
import { getOgImageUrl } from '@/lib/og'
import { buildMetadata } from '@/lib/metadata'
import { getAllProjects, getProjectBySlug } from '@/lib/content'
import { absoluteUrl } from '@/lib/seo'
import { isProjectLinkReady } from '@/lib/project-links'
import { site } from '@/lib/site'

interface PageProps {
  params: { slug: string }
}

const linkLabels: Record<string, string> = {
  pdf: 'Full report (PDF)',
  paper: 'Paper',
  github: 'Code',
  website: 'Website',
  demo: 'Demo',
}

export async function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const project = getProjectBySlug(params.slug)
  if (!project) return {}

  return {
    ...buildMetadata({
      title: project.title,
      description: project.description,
      path: `/projects/${project.slug}`,
      ogImage: getOgImageUrl(project.slug),
      tags: project.tags,
    }),
    authors: [{ name: site.name, url: absoluteUrl('/') }],
  }
}

export default function ProjectPage({ params }: PageProps) {
  const project = getProjectBySlug(params.slug)
  if (!project) return notFound()

  const links = Object.entries(project.links ?? {}).filter(
    ([key, href]) => key in linkLabels && isProjectLinkReady(href),
  ) as Array<[string, string]>
  const headings = (project.headings ?? []) as TocHeading[]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: absoluteUrl(`/projects/${project.slug}`),
    dateCreated: project.date,
    author: { '@type': 'Person', name: site.name, url: absoluteUrl('/') },
    keywords: project.tags,
  }

  return (
    <article lang={project.language ?? 'en'}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <header className="mb-10 border-b border-border pb-8">
        <Link href="/#projects" className="text-sm text-muted-foreground hover:text-foreground">
          ← Projects
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h1>
        <p className="mt-3 text-muted-foreground">{project.description}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          <time dateTime={project.date}>{formatDate(project.date)}</time>
          {project.tags?.length ? <> · {project.tags.join(', ')}</> : null}
        </p>
        {links.length ? (
          <p className="mt-3 flex flex-wrap gap-x-4 text-sm">
            {links.map(([key, href]) => (
              <a
                key={key}
                href={href}
                target={key === 'pdf' ? undefined : '_blank'}
                rel={key === 'pdf' ? undefined : 'noreferrer'}
                className="link"
              >
                {linkLabels[key]}
              </a>
            ))}
          </p>
        ) : null}
      </header>
      <div className="prose">
        <TableOfContents headings={headings} />
        <Mdx code={project.body.code} />
      </div>
    </article>
  )
}
