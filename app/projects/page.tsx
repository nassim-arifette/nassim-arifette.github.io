import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { ProjectsGrid } from '@/components/projects/ProjectsGrid'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects } from '@/lib/content'
import { toProjectCardData } from '@/lib/content-projections'

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
    <div className="pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="grid border-b border-border pb-12 pt-3 lg:grid-cols-[3rem_minmax(0,1fr)] lg:gap-10 lg:pb-16 lg:pt-8">
        <div className="hidden border-r border-border pr-3 lg:block">
          <span className="block text-center font-serif text-lg text-signal">01</span>
          <span className="mx-auto mt-5 block h-16 w-px bg-border" aria-hidden="true" />
        </div>
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.55fr)] md:items-end">
          <div>
            <p className="manuscript-label text-signal">Project archive · {projects.length} records</p>
            <h1 className="mt-5 max-w-[13ch] text-[clamp(3.4rem,7vw,6.6rem)] font-medium leading-[0.92] tracking-[-0.05em]">
              Work, methods, and what the evidence supports.
            </h1>
          </div>
          <div className="space-y-5 border-t border-border pt-5">
            <p className="max-w-[48ch] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Research internships, mathematical studies, and rapid prototypes documented
              through their question, implementation, and, where available, results and limitations.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/#research" className="editorial-link">
                View research threads <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link href="/cv" className="editorial-link text-foreground">
                Experience &amp; education <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </header>
      <section aria-label="Project filters and results" className="pt-10 sm:pt-12">
        <Suspense fallback={<p className="py-8 text-sm text-muted-foreground">Loading projects…</p>}>
          <ProjectsGrid projects={projects.map(toProjectCardData)} />
        </Suspense>
      </section>
    </div>
  )
}
