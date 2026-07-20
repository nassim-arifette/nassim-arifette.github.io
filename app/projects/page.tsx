import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { ProjectsGrid } from '@/components/projects/ProjectsGrid'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects } from '@/lib/content'

export const metadata: Metadata = buildMetadata({
  title: 'Projects',
  description: 'Selected research, internships, and side projects spanning machine learning, computer vision, and medical imaging.',
  path: '/projects',
  ogImage: getOgImageUrl(),
})

export default function ProjectsPage() {
  const projects = getAllProjects()
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
    <div className="space-y-12 pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="grid gap-8 border-b border-border/70 pb-10 pt-6 md:grid-cols-[1.25fr_0.75fr] md:items-end md:pt-12">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--signal))]">Project index · {projects.length} studies</p>
          <h1 className="max-w-3xl text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">Work, not just outputs.</h1>
        </div>
        <div className="space-y-5">
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Research, internships, and rapid prototypes—documented through the problem, the method, and what the evidence actually supports.
          </p>
          <Link href="/cv" className="group inline-flex items-center gap-2 text-sm font-semibold">Experience &amp; education <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
        </div>
      </header>
      <ProjectsGrid projects={projects} />
    </div>
  )
}
