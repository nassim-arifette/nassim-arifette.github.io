import { allProjects } from 'contentlayer/generated'
import { ProjectCard } from '@/components/cards/ProjectCard'

export const metadata = {
  title: 'Projects',
  description: 'Research, internships, and side projects',
}

export default function ProjectsPage() {
  const projects = [...allProjects].sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Projects</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} idAnchor />
        ))}
      </div>
    </div>
  )
}

