import type { Metadata } from 'next'
import Link from 'next/link'
import { allPosts, allProjects } from 'contentlayer/generated'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { PostCard } from '@/components/cards/PostCard'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Nassim Arifette — ML Engineer & Researcher',
  description:
    'Nassim Arifette is an ML engineer specializing in computer vision, 3D, and medical imaging, sharing selected projects, experiments, and research notes.',
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/'),
    title: 'Nassim Arifette — ML Engineer & Researcher',
    description:
      'Explore featured ML projects, research notes, and engineering writing from Nassim Arifette.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nassim Arifette — ML Engineer & Researcher',
    description:
      'ML engineer focusing on computer vision, 3D, and medical imaging — projects, experiments, and writing.',
  },
}

export default function HomePage() {
  const posts = [...allPosts]
    .filter((p) => p.published !== false)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 2)

  const projects = [...allProjects]
    .filter((p) => p.featured)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 3)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nassim Arifette',
    url: absoluteUrl('/'),
    headline: 'ML Engineer — Computer Vision, 3D, Medical Imaging',
    sameAs: [
      'https://www.linkedin.com/in/nassim-arifette',
      'https://github.com/nassim-arifette',
      'https://nassim-arifette.github.io',
      absoluteUrl('/cv'),
    ],
    description:
      'ML engineer focusing on computer vision, medical imaging, and reproducible research-grade systems.',
  }

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="space-y-5">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Hi, I’m Nassim Arifette.</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Graduate student in Artificial Intelligence at École Normale Supérieure Paris-Saclay M2 MVA. I am passionate about machine learning, computer vision, 3D, and medical imaging. I specialize in building reproducible research-grade systems with a focus on open science, reliable training infrastructure, and practical impact.
        </p>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/projects"
            className="inline-flex w-full items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 sm:w-auto"
          >
            View Projects
          </Link>
          <Link
            href="/blog"
            className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent sm:w-auto"
          >
            Read Blog
          </Link>
          <Link
            href="/cv"
            className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent sm:w-auto"
          >
            View CV
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Featured Projects</h2>
          <Link href="/projects" className="text-sm text-muted-foreground transition hover:text-foreground">All projects →</Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} idAnchor />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Latest Posts</h2>
          <Link href="/blog" className="text-sm text-muted-foreground transition hover:text-foreground">All posts →</Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}
