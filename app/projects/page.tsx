import type { Metadata } from 'next'
import { ProjectList } from '@/components/project-list'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects } from '@/lib/content'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Projects',
  description: 'Selected developer tools, AI applications, and award-winning hackathon prototypes.',
  path: '/projects',
  ogImage: getOgImageUrl(),
})

export default function ProjectsPage() {
  const projects = getAllProjects().filter((project) => project.category !== 'research')
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${site.name} - Projects`,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(project.url),
      name: project.title,
      description: project.description,
    })),
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-2 text-muted-foreground">
        Selected tools and applications, with source code, demos, and the results behind each project.
      </p>
      <div className="mt-8">
        <ProjectList projects={projects} />
      </div>
    </div>
  )
}
