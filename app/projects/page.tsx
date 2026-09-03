import type { Metadata } from 'next'
import { ProjectList } from '@/components/project-list'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects } from '@/lib/content'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Projects',
  description: 'Research projects, internships, and prototypes in machine learning, computer vision, and medical imaging.',
  path: '/projects',
  ogImage: getOgImageUrl(),
})

export default function ProjectsPage() {
  const projects = getAllProjects()
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${site.name} - Projects`,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/projects/${project.slug}`),
      name: project.title,
      description: project.description,
    })),
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-2 text-muted-foreground">
        Research internships, master’s projects, and hackathon prototypes. Each page describes the question, the
        method, and what the results support.
      </p>
      <div className="mt-8">
        <ProjectList projects={projects} />
      </div>
    </div>
  )
}
