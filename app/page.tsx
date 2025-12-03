import type { Metadata } from 'next'
import Link from 'next/link'
import { allPosts, allProjects } from 'contentlayer/generated'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { PostCard } from '@/components/cards/PostCard'
import { absoluteUrl } from '@/lib/seo'
import { HousePortal } from '@/components/house/HousePortal'

export const metadata: Metadata = {
  title: 'Nassim Arifette | ML Engineer & Researcher',
  description:
    'Nassim Arifette is an ML engineer specializing in computer vision, 3D, and medical imaging, sharing selected projects, experiments, and research notes.',
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/'),
    title: 'Nassim Arifette | ML Engineer & Researcher',
    description:
      'Explore featured ML projects, research notes, and engineering writing from Nassim Arifette.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nassim Arifette | ML Engineer & Researcher',
    description:
      'ML engineer focusing on computer vision, 3D, and medical imaging - projects, experiments, and writing.',
  },
}

export default function HomePage() {
  const posts = [...allPosts]
    .filter((p) => p.published !== false)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 2)

  const projectItems = [...allProjects].sort((a, b) => +new Date(b.date) - +new Date(a.date))

  const projects = projectItems
    .filter((p) => p.featured)
    .slice(0, 3)

  const hackathonProjects = projectItems.filter((p) => p.tags?.some((tag) => tag.toLowerCase() === 'hackathon'))

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nassim Arifette',
    url: absoluteUrl('/'),
    headline: 'ML Engineer - Computer Vision, 3D, Medical Imaging',
    jobTitle: 'Machine Learning Engineer',
    image: absoluteUrl('/og/default.png'),
    sameAs: [
      'https://www.linkedin.com/in/nassim-arifette',
      'https://github.com/nassim-arifette',
      'https://nassim-arifette.github.io',
      absoluteUrl('/cv'),
    ],
    description:
      'ML engineer focusing on computer vision, medical imaging, and reproducible research-grade systems.',
    knowsAbout: ['computer vision', 'medical imaging', 'deep learning', '3D reconstruction'],
    alumniOf: ['Ecole Normale Superieure Paris-Saclay'],
  }

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="space-y-5">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Hi, I&apos;m Nassim Arifette.</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Graduate student in Artificial Intelligence at Ecole Normale Superieure Paris-Saclay (M2 MVA).
          I focus on machine learning, computer vision, 3D, and medical imaging, with an emphasis on
          reproducible research-grade systems, reliable training infrastructure, and practical impact.
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
          <Link
            href="/hackathons"
            className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent sm:w-auto"
          >
            Hackathons
          </Link>
        </div>
      </section>

      <HousePortal
        projects={projectItems.map((p) => ({
          slug: p.slug,
          title: p.title,
          description: p.description,
          url: p.url,
          tags: p.tags ?? [],
          placement: p.placement,
          winner: p.winner,
          date: p.date,
        }))}
        hackathons={hackathonProjects.map((p) => ({
          slug: p.slug,
          title: p.title,
          description: p.description,
          url: p.url,
          tags: p.tags ?? [],
          placement: p.placement,
          winner: p.winner,
          date: p.date,
        }))}
      />

      <section className="space-y-4" id="quick-links">
        <h2 className="text-2xl font-semibold">Quick links</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/projects" className="rounded-md border px-3 py-1.5 transition hover:border-foreground/50">
            All projects
          </Link>
          <Link href="/blog" className="rounded-md border px-3 py-1.5 transition hover:border-foreground/50">
            All blog posts
          </Link>
          <Link href="/hackathons?winners=1" className="rounded-md border px-3 py-1.5 transition hover:border-foreground/50">
            Winning hackathons
          </Link>
          {projects[0] ? (
            <Link
              href={projects[0].url}
              className="rounded-md border px-3 py-1.5 transition hover:border-foreground/50"
            >
              Featured: {projects[0].title}
            </Link>
          ) : null}
          {posts[0] ? (
            <Link
              href={posts[0].url}
              className="rounded-md border px-3 py-1.5 transition hover:border-foreground/50"
            >
              Latest post: {posts[0].title}
            </Link>
          ) : null}
        </div>
      </section>

      <section className="space-y-6" id="projects">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold">Featured Projects</h2>
          <Link href="/projects" className="text-sm text-muted-foreground transition hover:text-foreground">{'All projects ->'}</Link>
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
          <Link href="/blog" className="text-sm text-muted-foreground transition hover:text-foreground">{'All posts ->'}</Link>
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
