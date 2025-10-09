'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Project } from 'contentlayer/generated'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { TagBar } from '@/components/filters/TagBar'
import { normalizeText } from '@/lib/search'

type ProjectsGridProps = {
  projects: Project[]
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
  const [tagMode, setTagMode] = useState<'AND' | 'OR'>('AND')

  const hasHydrated = useRef(false)

  useEffect(() => {
    const qParam = searchParams.get('q') ?? ''
    const tagsParam = searchParams.get('tags') ?? ''
    const modeParam = searchParams.get('tagMode') === 'OR' ? 'OR' : 'AND'
    const tagsFromParams = tagsParam.split(',').filter(Boolean)

    setQuery((current) => (current === qParam ? current : qParam))
    setActiveTags((current) => (arraysEqual(current, tagsFromParams) ? current : tagsFromParams))
    setTagMode((current) => (current === modeParam ? current : modeParam))
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

    if (tagMode === 'OR') {
      params.set('tagMode', 'OR')
    } else {
      params.delete('tagMode')
    }

    const next = params.toString()
    const current = searchParams.toString()
    if (next === current) return
    router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false })
  }, [query, activeTags, tagMode, router, pathname, searchParams])

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
        const matchesTags =
          activeTags.length === 0 ||
          (tagMode === 'AND'
            ? activeTags.every((tag) => projectTags.includes(tag))
            : activeTags.some((tag) => projectTags.includes(tag)))

        if (!matchesTags) {
          return false
        }

        if (!normalizedQuery) {
          return true
        }

        return haystack.includes(normalizedQuery)
      })
      .map((entry) => entry.ref)
  }, [indexedProjects, activeTags, normalizedQuery, tagMode])

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag],
    )
  }

  const clearFilters = () => {
    setActiveTags([])
    setQuery('')
    setTagMode('AND')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex flex-col">
            <label htmlFor="projects-search" className="sr-only">
              Search projects
            </label>
            <input
              id="projects-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects..."
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-72"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Tag mode:</span>
            <div className="inline-flex items-center rounded-md border border-border p-0.5">
              {(['AND', 'OR'] as const).map((mode) => {
                const selected = tagMode === mode
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTagMode(mode)}
                    className={`rounded px-2 py-1 font-medium transition ${
                      selected ? 'bg-foreground text-background' : 'hover:text-foreground'
                    }`}
                    aria-pressed={selected}
                  >
                    {mode}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        {(query || activeTags.length > 0 || tagMode === 'OR') && (
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
      <div aria-live="polite">
        {filteredProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects match your filters.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} idAnchor />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
