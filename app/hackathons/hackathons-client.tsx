'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProjectCard } from '@/components/cards/ProjectCard'
import type { ProjectCardData } from '@/lib/content-projections'

type HackathonsClientProps = {
  projects: ProjectCardData[]
}

export function HackathonsClient({ projects }: HackathonsClientProps) {
  const searchParams = useSearchParams()
  const winnersOnly = searchParams?.get('winners') === '1'

  const filtered = useMemo(
    () => (winnersOnly ? projects.filter((project) => project.winner === true) : projects),
    [projects, winnersOnly],
  )

  return (
    <div className="pb-8">
      <header className="grid gap-8 border-b border-border pb-12 pt-3 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.45fr)] md:items-end lg:pt-8">
        <div>
          <p className="manuscript-label text-signal">Rapid prototypes · Field constraints</p>
          <h1 className="mt-5 text-[clamp(3.4rem,7vw,6.6rem)] font-medium leading-[0.92] tracking-[-0.05em]">Hackathon work.</h1>
        </div>
        <div>
        <p className="text-sm leading-6 text-muted-foreground">
          A collection of the hackathons I have participated in and the projects shipped during those events.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href={winnersOnly ? '/hackathons' : '/hackathons?winners=1'}
            className={`inline-flex min-h-11 items-center gap-2 border px-3 py-1.5 transition-colors ${
              winnersOnly ? 'border-signal bg-signal text-background' : 'border-border hover:border-signal hover:text-signal'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
            {winnersOnly ? 'Showing winners only' : 'Show winning hackathons only'}
          </Link>
          {winnersOnly && (
            <span className="text-xs text-muted-foreground">
              {filtered.length} winner{filtered.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
        </div>
      </header>

      <section className="pt-10 sm:pt-12" aria-label="Hackathon projects">
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hackathon projects available yet.</p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {filtered.map((project, index) => (
            <ProjectCard key={project.slug} project={project} idAnchor index={index + 1} headingLevel={2} />
          ))}
        </div>
      )}
      </section>
    </div>
  )
}
