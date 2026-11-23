import Link from 'next/link'
import type { Project } from 'contentlayer/generated'
import { ProjectLinks } from './project-links'
import { ProjectResults } from './project-results'

const year = (project: Project) => new Date(project.date).getFullYear()

function thumbnailOf(project: Project) {
  if (project.preview?.type !== 'image') return undefined
  return (project.thumbnail ?? project.preview.src) as string
}

/** Large cards with a picture, for the most important work. */
export function ProjectCards({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
      {projects.map((project) => {
        const src = thumbnailOf(project)
        return (
          <li key={project.slug} className="group flex flex-col">
            <Link href={project.url} tabIndex={-1} aria-hidden="true" className="block overflow-hidden rounded-md border border-border bg-muted">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" loading="lazy" decoding="async"
                  className="aspect-[16/10] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]" />
              ) : (
                <div className="flex aspect-[16/10] items-end p-4 text-sm text-muted-foreground">
                  {project.tags?.slice(0, 3).join(' · ')}
                </div>
              )}
            </Link>
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <h3 className="font-medium leading-snug">
                <Link href={project.url} className="group-hover:text-accent">
                  {project.title}
                </Link>
              </h3>
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{year(project)}</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
            <ProjectResults project={project} />
            <ProjectLinks project={project} />
          </li>
        )
      })}
    </ul>
  )
}

/** Compact rows without pictures, for everything else. */
export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {projects.map((project) => (
        <li key={project.slug} className="py-4">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-medium leading-snug">
              <Link href={project.url} className="hover:text-accent">
                {project.title}
              </Link>
            </h3>
            <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{year(project)}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
          <ProjectResults project={project} />
          <ProjectLinks project={project} />
        </li>
      ))}
    </ul>
  )
}

/** Splits a ranked list: the first `count` entries that have a picture become cards. */
export function splitFeatured(projects: Project[], count = 4) {
  const featured = projects.filter((project) => thumbnailOf(project)).slice(0, count)
  const rest = projects.filter((project) => !featured.includes(project))
  return { featured, rest }
}
