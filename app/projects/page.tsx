import type { Metadata } from 'next'
import { ProjectCards, ProjectList, splitFeatured } from '@/components/project-list'
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
  const { featured, rest } = splitFeatured(projects)
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
        Tools and applications I built, most important first, with code, demos and results.
      </p>
      <div className="mt-10">
        <ProjectCards projects={featured} />
      </div>
      {rest.length ? (
        <section aria-labelledby="more-title" className="mt-14">
          <h2 id="more-title" className="section-title mb-3">More projects</h2>
          <ProjectList projects={rest} />
        </section>
      ) : null}
    </div>
  )
}
