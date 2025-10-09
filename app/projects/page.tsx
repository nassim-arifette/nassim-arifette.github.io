import type { Metadata } from 'next'
import { allProjects } from 'contentlayer/generated'
import { ProjectsGrid } from '@/components/projects/ProjectsGrid'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Projects — Nassim Arifette',
  description: 'Selected research, internships, and side projects spanning machine learning, computer vision, and medical imaging.',
  alternates: {
    canonical: absoluteUrl('/projects'),
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/projects'),
    title: 'Projects — Nassim Arifette',
    description:
      'Browse Nassim Arifette’s featured research and engineering projects across ML, computer vision, and medical imaging.',
  },
}

export default function ProjectsPage() {
  const projects = [...allProjects].sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Nassim Arifette — Projects',
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
      <h1 className="text-3xl font-semibold">Projects</h1>
      <ProjectsGrid projects={projects} />
    </div>
  )
}
