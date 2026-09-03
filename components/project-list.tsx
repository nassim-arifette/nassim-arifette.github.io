import Link from 'next/link'
import type { Project } from 'contentlayer/generated'
import { isProjectLinkReady } from '@/lib/project-links'

const linkLabels: Array<[string, string]> = [
  ['pdf', 'PDF'],
  ['paper', 'Paper'],
  ['github', 'Code'],
  ['website', 'Website'],
  ['demo', 'Demo'],
]

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul className="divide-y divide-border">
      {projects.map((project) => {
        const year = new Date(project.date).getFullYear()
        const links = linkLabels.filter(([key]) => isProjectLinkReady(project.links?.[key]))
        const placement = project.winner ? 'Winner' : project.placement

        return (
          <li key={project.slug} className="py-5">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-base font-medium leading-snug">
                <Link href={project.url} className="hover:text-accent">
                  {project.title}
                </Link>
                {placement ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">{placement}</span>
                ) : null}
              </h3>
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{year}</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
            {links.length ? (
              <p className="mt-2 flex flex-wrap gap-x-3 text-sm">
                {links.map(([key, label]) => (
                  <a
                    key={key}
                    href={project.links[key] as string}
                    target={key === 'pdf' ? undefined : '_blank'}
                    rel={key === 'pdf' ? undefined : 'noreferrer'}
                    className="link"
                  >
                    {label}
                  </a>
                ))}
              </p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
