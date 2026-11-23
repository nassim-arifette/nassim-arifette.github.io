import type { Project } from 'contentlayer/generated'

export function ProjectResults({ project }: { project: Project }) {
  const award = project.placement || (project.winner ? 'Winner' : undefined)
  if (!award && !project.contribution && project.githubStars == null) return null

  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
      {award ? <p className="text-accent">{award}</p> : null}
      {project.contribution ? <p>{project.contribution}</p> : null}
      {project.githubStars != null && project.links?.github ? (
        <a href={project.links.github} target="_blank" rel="noreferrer" className="hover:text-accent"
          title={`Count checked on ${project.githubStarsCheckedAt}`}>
          <span aria-hidden="true">★ </span>
          {project.githubStars} GitHub {project.githubStars === 1 ? 'star' : 'stars'}
        </a>
      ) : null}
    </div>
  )
}
