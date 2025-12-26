import type { Metadata } from 'next'
import Link from 'next/link'
import { ProjectsGrid } from '@/components/projects/ProjectsGrid'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects } from '@/lib/content'
import { getTagAggregates } from '@/lib/tags'
import { TagLink } from '@/components/tags/TagLink'

export const metadata: Metadata = buildMetadata({
  title: 'Projects',
  description: 'Selected research, internships, and side projects spanning machine learning, computer vision, and medical imaging.',
  path: '/projects',
  ogImage: getOgImageUrl(),
})

export default function ProjectsPage() {
  const projects = getAllProjects()
  const tagHighlights = getTagAggregates()
    .filter((tag) => tag.projects.length > 0)
    .sort((a, b) => b.projects.length - a.projects.length || a.tag.localeCompare(b.tag))
    .slice(0, 12)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Nassim Arifette - Projects',
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/projects/${project.slug}`),
      name: project.title,
      description: project.description,
    })),
  }

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Research, internships, and side projects across ML, computer vision, and medical imaging.
        </p>
        {tagHighlights.length > 0 ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {tagHighlights.map((tag) => (
                <TagLink
                  key={tag.slug}
                  tag={tag.tag}
                  variant="secondary"
                  className="transition hover:text-foreground"
                />
              ))}
            </div>
            <div>
              <Link href="/tags" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                View all tags
              </Link>
            </div>
          </div>
        ) : null}
      </div>
      <ProjectsGrid projects={projects} />
    </div>
  )
}
