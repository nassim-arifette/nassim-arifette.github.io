import Link from 'next/link'
import { ArrowUpRight, Github, ExternalLink, FileText, FileDown } from 'lucide-react'
import type { Project } from 'contentlayer/generated'
import { formatDate } from '@/lib/mdx'
import { getPreviewText } from '@/lib/preview'
import { cn } from '@/lib/utils'
import { TagLink } from '@/components/tags/TagLink'
import { isProjectLinkReady } from '@/lib/project-links'

type Links = { github?: string; demo?: string; paper?: string; pdf?: string; website?: string }
type ProjectCardProject = Pick<Project, 'title' | 'date' | 'description' | 'tags' | 'links' | 'slug' | 'url' | 'body' | 'placement' | 'winner'> & { links?: Links }
type ProjectCardProps = { project: ProjectCardProject; idAnchor?: boolean; className?: string; index?: number }

export function ProjectCard({ project, idAnchor, className, index }: ProjectCardProps) {
  const preview = getPreviewText(project.body?.raw, project.description)
  const isWinner = project.winner === true
  const placementLabel = isWinner ? '🏆 Winner' : project.placement
  const hasLinks = Object.values(project.links ?? {}).some(isProjectLinkReady)
  const actionClasses = 'inline-flex min-h-8 items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground [@media(pointer:coarse)]:min-h-11'

  return (
    <article id={idAnchor ? project.slug : undefined} className={cn('group relative flex h-full flex-col bg-card p-6 transition-colors duration-300 hover:bg-accent/45 sm:p-7', isWinner ? 'ring-1 ring-inset ring-amber-400/70' : '', className)}>
      <div className="flex flex-1 flex-col gap-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-muted-foreground">
          <span>{index ? String(index).padStart(2, '0') : 'Project'}</span><span>{formatDate(project.date)}</span>
        </div>
        <div className="flex items-start justify-between gap-3 pr-8">
          <h3 className="text-xl font-semibold leading-tight tracking-[-0.025em]">
            {project.url ? <Link href={project.url} className="transition-colors hover:text-[hsl(var(--signal))]" prefetch>{project.title}</Link> : project.title}
          </h3>
          {placementLabel ? <span className={cn('shrink-0 border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide', isWinner ? 'border-amber-400 bg-amber-300 text-black' : 'border-border bg-muted text-foreground')}>{placementLabel}</span> : null}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
        {preview && preview !== project.description ? <p className="line-clamp-3 text-sm leading-relaxed text-foreground/75">{preview}</p> : null}
        {project.tags?.length ? <div className="flex flex-wrap gap-2">{project.tags.slice(0, 4).map((tag) => <TagLink key={tag} tag={tag} variant="secondary" className="transition hover:text-foreground" />)}</div> : null}
      </div>
      {hasLinks ? <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 pt-4 pr-10">
        {isProjectLinkReady(project.links?.github) && <a href={project.links.github} target="_blank" rel="noreferrer" className={actionClasses}><Github size={14} /> GitHub</a>}
        {isProjectLinkReady(project.links?.website) && <a href={project.links.website} target="_blank" rel="noreferrer" className={actionClasses}><ExternalLink size={14} /> Website</a>}
        {isProjectLinkReady(project.links?.demo) && <a href={project.links.demo} target="_blank" rel="noreferrer" className={actionClasses}><ExternalLink size={14} /> Demo</a>}
        {isProjectLinkReady(project.links?.paper) && <a href={project.links.paper} target="_blank" rel="noreferrer" className={actionClasses}><FileText size={14} /> Paper</a>}
        {isProjectLinkReady(project.links?.pdf) && <a href={project.links.pdf} target="_blank" rel="noreferrer" className={actionClasses}><FileDown size={14} /> Report</a>}
      </div> : null}
      {project.url ? <Link href={project.url} aria-label={`View ${project.title}`} className="absolute bottom-6 right-6 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background"><ArrowUpRight size={16} /></Link> : null}
    </article>
  )
}
