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
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Hi, I’m Nassim Arifette.</h1>
        <p className="text-muted-foreground max-w-2xl">
          I build research-grade ML systems for computer vision, 3D, and medical imaging — with an emphasis on reproducibility,
          reliable training infrastructure, and practical impact. Explore selected projects and notes below.
        </p>
        <div className="flex gap-3">
          <Link href="/projects" className="inline-flex items-center rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90">
            View Projects
          </Link>
          <Link href="/blog" className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
            Read Blog
          </Link>
          <Link href="/cv" className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
            View CV
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Projects</h2>
          <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">All projects →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} idAnchor />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Latest Posts</h2>
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">All posts →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}
