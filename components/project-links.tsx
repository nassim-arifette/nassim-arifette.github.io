import type { Project } from 'contentlayer/generated'
import { isProjectLinkReady } from '@/lib/project-links'

const linkLabels: Array<[string, string]> = [
  ['website', 'Website'],
  ['demo', 'Demo'],
  ['github', 'Code'],
  ['paper', 'Paper'],
  ['pdf', 'PDF'],
]

export function ProjectLinks({ project, className = 'mt-2' }: { project: Project; className?: string }) {
  const links = linkLabels.filter(([key]) => isProjectLinkReady(project.links?.[key]))
  if (!links.length) return null

  return (
    <p className={`${className} flex flex-wrap gap-x-3 text-sm`}>
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
  )
}
