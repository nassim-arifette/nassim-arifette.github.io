import type { Metadata } from 'next'
import { allProjects } from 'contentlayer/generated'
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

export default function HackathonsPage() {
  const hackathonProjects = [...allProjects]
    .filter((project) => project.tags?.some((tag) => tag.toLowerCase() === 'hackathon'))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Hackathons</h1>
        <p className="text-sm text-muted-foreground">
          A collection of the hackathons I have participated in and the projects shipped during those events.
        </p>
      </header>

      {hackathonProjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hackathon projects available yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hackathonProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} idAnchor />
          ))}
        </div>
      )}
    </div>
  )
}
