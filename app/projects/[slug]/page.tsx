import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { allProjects } from 'contentlayer/generated'
import { Github, ExternalLink, FileText, FileDown } from 'lucide-react'
import { Mdx } from '@/components/mdx/mdx-client'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/mdx'
import { absoluteUrl } from '@/lib/seo'
import { slugifyTag } from '@/lib/utils'

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

export async function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const project = allProjects.find((p) => p.slug === params.slug)
  if (!project) return {}

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
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
    },
  }
}

export default function ProjectPage({ params }: PageProps) {
  const project = allProjects.find((p) => p.slug === params.slug)
  if (!project) return notFound()

  const linkEntries = Object.entries(project.links ?? {}) as Array<[
    keyof typeof linkConfig,
    string,
  ]>

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: absoluteUrl(`/projects/${project.slug}`),
    datePublished: project.date,
    keywords: project.tags,
  }

  return (
    <article className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="space-y-4">
        <p className="text-sm text-muted-foreground">{formatDate(project.date)}</p>
        <h1 className="text-3xl font-semibold leading-tight">{project.title}</h1>
        <p className="text-base text-muted-foreground max-w-2xl">{project.description}</p>
        {project.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Link key={tag} href={`/tags/${slugifyTag(tag)}`} className="inline-flex">
                <Badge variant="secondary" className="transition hover:bg-foreground hover:text-background">
                  #{tag}
                </Badge>
              </Link>
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

      <div className="prose">
        <Mdx code={project.body.code} />
      </div>
    </article>
  )
}
