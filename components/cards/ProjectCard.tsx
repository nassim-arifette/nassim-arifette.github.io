import Link from 'next/link'
import { ExternalLink, FileDown, FileText, Github } from 'lucide-react'
import { formatDate } from '@/lib/mdx'
import { getPreviewText } from '@/lib/preview'
import { cn } from '@/lib/utils'
import { TagLink } from '@/components/tags/TagLink'
import { isProjectLinkReady } from '@/lib/project-links'
import type { ProjectCardData } from '@/lib/content-projections'

type Links = {
  github?: string
  demo?: string
  paper?: string
  pdf?: string
  website?: string
}

type ProjectCardProject = ProjectCardData & { links?: Links }

type ProjectCardProps = {
  project: ProjectCardProject
  idAnchor?: boolean
  className?: string
  index?: number
  headingLevel?: 2 | 3
}

export function ProjectCard({ project, idAnchor, className, index, headingLevel = 3 }: ProjectCardProps) {
  const preview = project.preview ?? getPreviewText(project.body?.raw, project.description)
  const isWinner = project.winner === true
  const placementLabel = isWinner ? 'Winner' : project.placement
  const hasLinks = Object.values(project.links ?? {}).some(isProjectLinkReady)
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const actionClasses =
    'inline-flex min-h-9 items-center gap-1.5 border-b border-transparent text-xs text-muted-foreground transition-colors hover:border-current hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [@media(pointer:coarse)]:min-h-11'

  return (
    <article
      id={idAnchor ? project.slug : undefined}
      className={cn(
        'group grid min-w-0 scroll-mt-28 gap-4 bg-card p-5 transition-colors duration-200 hover:bg-accent/45 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:p-7',
        className,
      )}
    >
      <div className="flex items-start justify-between sm:block">
        {typeof index === 'number' ? (
          <span className="font-serif text-lg tabular-nums text-signal" aria-hidden="true">
            {String(index).padStart(2, '0')}
          </span>
        ) : (
          <span className="manuscript-label" aria-hidden="true">Project</span>
        )}
        <time dateTime={project.date} className="manuscript-label sm:mt-3 sm:block sm:[writing-mode:vertical-rl]">
          {formatDate(project.date)}
        </time>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Heading className="max-w-[32ch] text-2xl font-medium leading-tight tracking-[-0.02em]">
            {project.url ? (
              <Link
                href={project.url}
                className="inline-flex min-h-11 items-center decoration-signal/50 underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [@media(pointer:coarse)]:min-h-12"
                prefetch
              >
                {project.title}
              </Link>
            ) : (
              project.title
            )}
          </Heading>
          {placementLabel ? (
            <span
              className={cn(
                'shrink-0 border px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em]',
                isWinner
                  ? 'border-annotation/60 bg-annotation/15 text-foreground'
                  : 'border-border text-muted-foreground',
              )}
            >
              {placementLabel}
            </span>
          ) : null}
        </div>

        <p className="mt-3 max-w-[70ch] text-sm leading-6 text-foreground">{project.description}</p>
        {preview && preview !== project.description ? (
          <p className="mt-2 line-clamp-2 max-w-[76ch] text-sm leading-6 text-muted-foreground">
            {preview}
          </p>
        ) : null}

        {project.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
            {project.tags.slice(0, 4).map((tag) => (
              <TagLink
                key={tag}
                tag={tag}
                variant="secondary"
                className="border-0 bg-transparent px-0 text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-signal"
              />
            ))}
          </div>
        ) : null}

        {hasLinks ? (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/75 pt-3">
            {isProjectLinkReady(project.links?.github) && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noreferrer"
                aria-label="Open GitHub repository in a new tab"
                className={actionClasses}
              >
                <Github size={13} aria-hidden="true" /> GitHub
              </a>
            )}
            {isProjectLinkReady(project.links?.website) && (
              <a
                href={project.links.website}
                target="_blank"
                rel="noreferrer"
                aria-label="Open project website in a new tab"
                className={actionClasses}
              >
                <ExternalLink size={13} aria-hidden="true" /> Website
              </a>
            )}
            {isProjectLinkReady(project.links?.demo) && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noreferrer"
                aria-label="Open project demo in a new tab"
                className={actionClasses}
              >
                <ExternalLink size={13} aria-hidden="true" /> Demo
              </a>
            )}
            {isProjectLinkReady(project.links?.paper) && (
              <a
                href={project.links.paper}
                target="_blank"
                rel="noreferrer"
                aria-label="Open paper in a new tab"
                className={actionClasses}
              >
                <FileText size={13} aria-hidden="true" /> Paper
              </a>
            )}
            {isProjectLinkReady(project.links?.pdf) && (
              <a href={project.links.pdf} className={actionClasses}>
                <FileDown size={13} aria-hidden="true" /> Full report
              </a>
            )}
          </div>
        ) : null}
      </div>
    </article>
  )
}
