import type { Metadata } from 'next'
import { allProjects } from 'contentlayer/generated'
import Link from 'next/link'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Hackathons – Nassim Arifette',
  description: 'Hackathons I have participated in and the projects built during each event.',
  alternates: {
    canonical: absoluteUrl('/hackathons'),
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/hackathons'),
    title: 'Hackathons – Nassim Arifette',
    description: 'Projects built during hackathons I have joined.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hackathons – Nassim Arifette',
    description: 'Projects built during hackathons I have joined.',
  },
}

export default function HackathonsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const hackathonProjects = [...allProjects]
    .filter((project) => project.tags?.some((tag) => tag.toLowerCase() === 'hackathon'))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const winnersOnly = searchParams?.winners === '1'
  const filtered = winnersOnly ? hackathonProjects.filter((p) => p.winner === true) : hackathonProjects

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Hackathons</h1>
        <p className="text-sm text-muted-foreground">
          A collection of the hackathons I have participated in and the projects shipped during those events.
        </p>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href={winnersOnly ? '/hackathons' : '/hackathons?winners=1'}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 transition ${
              winnersOnly ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground/50'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
            {winnersOnly ? 'Showing winners only' : 'Show winning hackathons only'}
          </Link>
          {winnersOnly && (
            <span className="text-xs text-muted-foreground">{filtered.length} winner{filtered.length === 1 ? '' : 's'}</span>
          )}
        </div>
      </header>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hackathon projects available yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} idAnchor />
          ))}
        </div>
      )}
    </div>
  )
}
