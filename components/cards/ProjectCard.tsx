import Link from 'next/link'
import { Github, ExternalLink, FileText, FileDown } from 'lucide-react'
import type { Project } from 'contentlayer/generated'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/mdx'

type Links = { github?: string; demo?: string; paper?: string; pdf?: string }

type ProjectCardProject = Pick<Project, 'title' | 'date' | 'description' | 'tags' | 'links' | 'slug' | 'url'> & {
  links?: Links
}

type ProjectCardProps = {
  project: ProjectCardProject
  idAnchor?: boolean
}

export function ProjectCard({ project, idAnchor }: ProjectCardProps) {
  return (
    <article
      id={idAnchor ? project.slug : undefined}
      className="group relative overflow-hidden rounded-lg border bg-card p-5 transition duration-200 ease-out hover:-translate-y-1 hover:border-foreground/40 hover:shadow-lg"
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

      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-medium leading-tight">{project.title}</h3>
          <span className="shrink-0 text-xs text-muted-foreground">{formatDate(project.date)}</span>
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

      {(project.links?.github || project.links?.demo || project.links?.paper || project.links?.pdf) && (
        <div className="relative z-20 mt-4 flex items-center gap-3 text-sm">
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
    </article>
  )
}
