import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, FileText } from 'lucide-react'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { PostCard } from '@/components/cards/PostCard'
import { absoluteUrl } from '@/lib/seo'
import { buildMetadata } from '@/lib/metadata'
import { getOgImageUrl } from '@/lib/og'
import { getAllProjects, getPublishedPosts } from '@/lib/content'

export const metadata: Metadata = buildMetadata({
  title: 'ML Engineer & Researcher',
  description: 'Nassim Arifette builds reliable machine-learning systems for computer vision, medical imaging, and scientific research.',
  path: '/',
  ogImage: getOgImageUrl(),
})

const focusAreas = ['Computer vision', 'Medical imaging', 'Reliable ML']

export default function HomePage() {
  const posts = getPublishedPosts().slice(0, 2)
  const projectItems = getAllProjects()
  const projects = projectItems.filter((project) => project.featured).slice(0, 3)
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'Person', name: 'Nassim Arifette', url: absoluteUrl('/'),
    headline: 'ML Engineer — Computer Vision, 3D, Medical Imaging', jobTitle: 'Machine Learning Engineer', image: getOgImageUrl(),
    sameAs: ['https://www.linkedin.com/in/nassim-arifette', 'https://github.com/nassim-arifette', 'https://nassim-arifette.github.io', absoluteUrl('/cv')],
    description: 'ML engineer focusing on computer vision, medical imaging, and reproducible research-grade systems.',
    knowsAbout: ['computer vision', 'medical imaging', 'deep learning', '3D reconstruction'], alumniOf: ['École Normale Supérieure Paris-Saclay'],
  }

  return (
    <div className="space-y-24 pb-8 sm:space-y-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="relative min-h-[68vh] border-b border-border/70 pb-14 pt-8 sm:pt-16">
        <div className="absolute right-0 top-6 hidden text-[clamp(5rem,13vw,11rem)] font-semibold leading-none tracking-[-0.08em] text-foreground/[0.035] lg:block" aria-hidden="true">NA</div>
        <p className="mb-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--signal))]" /> Paris · Open to research &amp; engineering work
        </p>
        <h1 className="max-w-5xl text-[clamp(3.1rem,8.5vw,7.25rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
          I build ML systems for the <span className="text-[hsl(var(--signal))]">physical world.</span>
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)] md:items-end">
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            I&apos;m Nassim Arifette, an M2 MVA graduate student at ENS Paris-Saclay working across computer vision, 3D, medical imaging, and dependable research infrastructure.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-3 md:justify-end">
            <Link href="/projects" className="group inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-semibold">Explore the work <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={16} /></Link>
            <a href="/cv.pdf" className="inline-flex items-center gap-2 border-b border-border pb-1 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground">Download CV <FileText size={15} /></a>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-border/70 pt-5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
          <span className="mr-2 text-foreground">Focus</span>{focusAreas.map((area) => <span key={area}>{area}</span>)}<ArrowDown className="ml-auto hidden sm:block" size={16} aria-hidden="true" />
        </div>
      </section>

      <section id="projects" className="space-y-8 scroll-mt-24">
        <div className="grid gap-4 border-b border-border/70 pb-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--signal))]">Selected work</p><h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Research made tangible.</h2></div>
          <Link href="/projects" className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">All {projectItems.length} projects <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5" /></Link>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border lg:grid-cols-2">
          {projects.map((project, index) => <ProjectCard key={project.slug} project={project} idAnchor index={index + 1} />)}
        </div>
      </section>

      <section className="grid gap-10 border-y border-border/70 py-12 md:grid-cols-[0.7fr_1.3fr] md:py-16">
        <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--signal))]">Field notes</p><h2 className="max-w-xs text-3xl font-semibold tracking-[-0.035em]">Ideas, experiments, and working knowledge.</h2><Link href="/blog" className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">Browse all writing <ArrowUpRight size={15} /></Link></div>
        <div className="grid gap-4 sm:grid-cols-2">{posts.length ? posts.map((post) => <PostCard key={post.slug} post={post} />) : <p className="text-muted-foreground">New research notes are in progress.</p>}</div>
      </section>

      <section className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Interested in reliable ML for difficult, real-world data?</h2>
        <div className="flex flex-col items-start gap-3 sm:items-end"><Link href="/cv" className="group inline-flex items-center gap-2 bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:bg-[hsl(var(--signal))] hover:text-white">Contact &amp; experience <ArrowUpRight size={16} /></Link><Link href="/projects" className="text-sm text-muted-foreground underline-offset-4 hover:underline">View the work first</Link></div>
      </section>
    </div>
  )
}
