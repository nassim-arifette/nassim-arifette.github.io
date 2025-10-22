import Link from 'next/link'
import { Github, ExternalLink, FileText, FileDown } from 'lucide-react'
import type { Project } from 'contentlayer/generated'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/mdx'
import { getPreviewText } from '@/lib/preview'
import { cn } from '@/lib/utils'

type Links = { github?: string; demo?: string; paper?: string; pdf?: string; website?: string }

type ProjectCardProject = Pick<
  Project,
  'title' | 'date' | 'description' | 'tags' | 'links' | 'slug' | 'url' | 'body'
> & {
  links?: Links
}

type ProjectCardProps = {
  project: ProjectCardProject
  idAnchor?: boolean
  className?: string
}

export function ProjectCard({ project, idAnchor, className }: ProjectCardProps) {
  const preview = getPreviewText(project.body?.raw, project.description)
  const hasLinks =
    project.links?.github ||
    project.links?.website ||
    project.links?.demo ||
    project.links?.paper ||
    project.links?.pdf

  return (
    <article
      id={idAnchor ? project.slug : undefined}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card p-5 transition duration-200 ease-out hover:-translate-y-1 hover:border-foreground/40 hover:shadow-lg',
        className,
      )}
    >
      {project.url ? (
        <Link
          href={project.url}
          className="absolute inset-0 z-10"
          aria-label={`View ${project.title}`}
          prefetch
        >
          <span className="sr-only">View {project.title}</span>
        </Link>
      ) : null}

      <div className="relative flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <h3 className="text-lg font-medium leading-tight">{project.title}</h3>
          <span className="shrink-0 text-xs text-muted-foreground sm:text-right">{formatDate(project.date)}</span>
        </div>
        <p className="text-sm text-muted-foreground">{project.description}</p>
        {project.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        ) : null}
      </div>

      {hasLinks && (
        <div className="relative z-20 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          {project.links?.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground hover:underline"
            >
              <Github size={16} /> GitHub
            </a>
          )}
          {project.links?.website && (
            <a
              href={project.links.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground hover:underline"
            >
              <ExternalLink size={16} /> Website
            </a>
          )}
          {project.links?.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground hover:underline"
            >
              <ExternalLink size={16} /> Demo
            </a>
          )}
          {project.links?.paper && (
            <a
              href={project.links.paper}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground hover:underline"
            >
              <FileText size={16} /> Paper
            </a>
          )}
          {project.links?.pdf && (
            <a
              href={project.links.pdf}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground hover:underline"
            >
              <FileDown size={16} /> PDF
            </a>
          )}
        </div>
      )}

      {preview && (
        <div className="pointer-events-none absolute inset-0 z-20 translate-y-2 opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <div className="flex h-full flex-col justify-between rounded-lg border border-border/80 bg-background/95 p-5 text-sm text-muted-foreground shadow-lg backdrop-blur">
            <p className="max-h-40 overflow-hidden">{preview}</p>
            <span className="mt-4 text-xs font-medium text-foreground/70">View project →</span>
          </div>
        </div>
      )}
    </article>
  )
}


