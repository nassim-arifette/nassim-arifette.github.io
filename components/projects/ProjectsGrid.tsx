'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import type { ProjectCardData } from '@/lib/content-projections'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { TagBar } from '@/components/filters/TagBar'
import { normalizeText } from '@/lib/search'

type ProjectsGridProps = {
  projects: ProjectCardData[]
}

const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])

  const hasHydrated = useRef(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const qParam = searchParams.get('q') ?? ''
    const tagsParam = searchParams.get('tags') ?? ''
    const tagsFromParams = tagsParam.split(',').filter(Boolean)

    setQuery((current) => (current === qParam ? current : qParam))
    setActiveTags((current) => (arraysEqual(current, tagsFromParams) ? current : tagsFromParams))
    hasHydrated.current = true
  }, [searchParams])

  useEffect(() => {
    if (!hasHydrated.current) return

    const params = new URLSearchParams(Array.from(searchParams.entries()))

    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }

    if (activeTags.length > 0) {
      params.set('tags', activeTags.join(','))
    } else {
      params.delete('tags')
    }

    const next = params.toString()
    const current = searchParams.toString()
    if (next === current) return
    router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false })
  }, [query, activeTags, router, pathname, searchParams])

  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = useMemo(() => (deferredQuery ? normalizeText(deferredQuery) : ''), [deferredQuery])

  const indexedProjects = useMemo(() => {
    return projects.map((project) => ({
      ref: project,
      haystack: normalizeText([project.title, project.description, ...(project.tags ?? [])].join(' ')),
    }))
  }, [projects])

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const project of projects) {
      for (const tag of project.tags ?? []) {
        const trimmed = tag.trim()
        if (!trimmed) continue
        counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1)
      }
    }
    return counts
  }, [projects])

  const allTags = useMemo(() => Array.from(tagCounts.keys()), [tagCounts])

  const filteredProjects = useMemo(() => {
    return indexedProjects
      .filter(({ ref, haystack }) => {
        const projectTags = ref.tags ?? []
        const matchesTags = activeTags.length === 0 || activeTags.every((tag) => projectTags.includes(tag))

        if (!matchesTags) {
          return false
        }

        if (!normalizedQuery) {
          return true
        }

        return haystack.includes(normalizedQuery)
      })
      .map((entry) => entry.ref)
  }, [indexedProjects, activeTags, normalizedQuery])

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag],
    )
  }

  const clearFilters = () => {
    setActiveTags([])
    setQuery('')
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.key !== '/') return
      const target = event.target as HTMLElement | null
      const isInteractive =
        target?.closest('a, button, input, textarea, select, [contenteditable]') != null
      if (isInteractive && target !== searchInputRef.current) return

      event.preventDefault()
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 border-y border-border py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-md flex-col gap-2">
          <label
            htmlFor="projects-search"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Search projects
          </label>
          <div className="relative">
            <input
              id="projects-search"
              type="search"
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, method, or field"
              className="h-11 w-full border-0 border-b border-foreground/40 bg-transparent pl-7 pr-10 text-sm transition-colors focus:border-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Search aria-hidden="true" className="absolute bottom-3 left-0 text-muted-foreground" size={16} />
            <kbd className="pointer-events-none absolute bottom-2.5 right-1 hidden border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">/</kbd>
          </div>
        </div>
        {(query || activeTags.length > 0) && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
      {allTags.length > 0 && (
        <TagBar
          tags={allTags}
          counts={tagCounts}
          active={activeTags}
          onToggle={toggleTag}
          onClear={clearFilters}
          label="Filter projects by tag"
        />
      )}
      <p className="manuscript-label" aria-live="polite">
        {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} shown
      </p>
      <div>
        {filteredProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects match your filters.</p>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} idAnchor index={index + 1} headingLevel={2} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
