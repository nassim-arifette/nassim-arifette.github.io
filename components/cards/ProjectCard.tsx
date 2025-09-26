import { Github, ExternalLink, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Links = { github?: string; demo?: string; paper?: string }
type Project = {
  title: string
  date: string
  description: string
  tags?: string[]
  links?: Links
  slug: string
}

export function ProjectCard({ project, idAnchor = false }: { project: Project; idAnchor?: boolean }) {
  return (
    <div id={idAnchor ? project.slug : undefined} className="rounded-lg border p-5 bg-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-medium leading-tight">{project.title}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">{new Date(project.date).toLocaleDateString()}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
      {project.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
      ) : null}
      {(project.links?.github || project.links?.demo || project.links?.paper) && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          {project.links?.github && (
            <a className="inline-flex items-center gap-1 hover:underline" href={project.links.github} target="_blank" rel="noreferrer">
              <Github size={16} /> GitHub
            </a>
          )}
          {project.links?.demo && (
            <a className="inline-flex items-center gap-1 hover:underline" href={project.links.demo} target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> Demo
            </a>
          )}
          {project.links?.paper && (
            <a className="inline-flex items-center gap-1 hover:underline" href={project.links.paper} target="_blank" rel="noreferrer">
              <FileText size={16} /> Paper
            </a>
          )}
        </div>
      )}
    </div>
  )
}

