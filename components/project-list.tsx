import Link from 'next/link'
import type { Project } from 'contentlayer/generated'
import { isProjectLinkReady } from '@/lib/project-links'
import { ProjectResults } from './project-results'

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

        return (
          <li key={project.slug} className="py-5 sm:flex sm:gap-5">
            {project.preview?.type === 'image' ? (
              <Link href={project.url} tabIndex={-1} aria-hidden="true" className="mb-3 block shrink-0 sm:mb-0 sm:w-36">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.thumbnail ?? project.preview.src} alt="" loading="lazy" decoding="async"
                  className="aspect-[4/3] w-full border border-border object-cover object-top" />
              </Link>
            ) : null}
            <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-base font-medium leading-snug">
                <Link href={project.url} className="hover:text-accent">
                  {project.title}
                </Link>
              </h3>
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{year}</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
            <ProjectResults project={project} />
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
            </div>
          </li>
        )
      })}
    </ul>
  )
}
