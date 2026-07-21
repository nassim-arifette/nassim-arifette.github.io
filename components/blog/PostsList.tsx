'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { PostListItem } from '@/lib/content-projections'
import { TagBar } from '@/components/filters/TagBar'
import { normalizeText } from '@/lib/search'
import { formatDate } from '@/lib/mdx'

type SeriesMeta = {
  seriesTitle: string
  seriesSlug: string
  index: number
  total: number
}

type PostsListProps = {
  posts: PostListItem[]
  seriesInfo?: Record<string, SeriesMeta>
}

const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

export function PostsList({ posts, seriesInfo }: PostsListProps) {
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

  const indexedPosts = useMemo(() => {
    return posts.map((post) => {
      const seriesMeta = seriesInfo?.[post.slug]
      const fields = [post.title, post.description, ...(post.tags ?? [])]
      if (seriesMeta) {
        fields.push(seriesMeta.seriesTitle, `Part ${seriesMeta.index + 1}`)
      }
      return {
        ref: post,
        haystack: normalizeText(fields.join(' ')),
      }
    })
  }, [posts, seriesInfo])

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        const trimmed = tag.trim()
        if (!trimmed) continue
        counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1)
      }
    }
    return counts
  }, [posts])

  const allTags = useMemo(() => Array.from(tagCounts.keys()), [tagCounts])

  const filteredPosts = useMemo(() => {
    return indexedPosts
      .filter(({ ref, haystack }) => {
        const postTags = ref.tags ?? []
        const matchesTags = activeTags.length === 0 || activeTags.every((tag) => postTags.includes(tag))

        if (!matchesTags) return false
        if (!normalizedQuery) return true
        return haystack.includes(normalizedQuery)
      })
      .map((entry) => entry.ref)
  }, [indexedPosts, activeTags, normalizedQuery])

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
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, button, a, [contenteditable]')) return

      event.preventDefault()
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    }

    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  const filtersActive = Boolean(query || activeTags.length > 0)
  const resultLabel = `${filteredPosts.length} ${filteredPosts.length === 1 ? 'note' : 'notes'}${
    filtersActive ? ' match the current filters' : ' in the notebook'
  }`

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex w-full max-w-md flex-col gap-2">
          <label
            htmlFor="posts-search"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Search the notebook
          </label>
          <div className="relative">
            <input
              id="posts-search"
              type="search"
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, method, or topic"
              className="h-11 w-full border-0 border-b border-foreground/40 bg-transparent px-0 pr-10 text-sm transition focus:border-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2.5 right-0 hidden border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block"
            >
              /
            </kbd>
          </div>
        </div>
        {filtersActive ? (
          <button
            type="button"
            onClick={clearFilters}
            className="self-start text-sm text-muted-foreground underline decoration-border underline-offset-4 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:self-auto"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {allTags.length > 0 ? (
        <TagBar
          tags={allTags}
          counts={tagCounts}
          active={activeTags}
          onToggle={toggleTag}
          onClear={clearFilters}
          label="Filter notes by tag"
        />
      ) : null}

      <p
        className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {resultLabel}
      </p>

      {filteredPosts.length === 0 ? (
        <div className="border-y border-border/80 py-8">
          <p className="text-sm font-medium">No notes found.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a broader search or clear one of the topic filters.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/80 border-y border-border/80">
          {filteredPosts.map((post, index) => {
            const seriesMeta = seriesInfo?.[post.slug]
            return (
              <li key={post.slug}>
                <article className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 py-6 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:gap-x-6">
                  <span aria-hidden="true" className="pt-1 text-xs tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      {seriesMeta ? (
                        <>
                          <span className="font-semibold uppercase tracking-[0.14em] text-foreground">Series</span>
                          <span aria-hidden="true">·</span>
                          <Link
                            href={`/series/${seriesMeta.seriesSlug}`}
                            className="transition hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            {seriesMeta.seriesTitle}
                          </Link>
                          {seriesMeta.index > 0 ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Part {seriesMeta.index + 1}</span>
                            </>
                          ) : null}
                        </>
                      ) : (
                        <span className="font-semibold uppercase tracking-[0.14em] text-foreground">Note</span>
                      )}
                      <span aria-hidden="true" className="sm:hidden">
                        ·
                      </span>
                      <time dateTime={post.date} className="tabular-nums sm:hidden">
                        {formatDate(post.date)}
                      </time>
                    </div>

                    <h2 className="text-xl font-semibold leading-snug tracking-[-0.02em] sm:text-2xl">
                      <Link
                        href={post.url}
                        className="rounded-sm transition-colors hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {post.description}
                    </p>
                  </div>

                  <time
                    dateTime={post.date}
                    className="hidden whitespace-nowrap pt-1 text-xs tabular-nums text-muted-foreground sm:block"
                  >
                    {formatDate(post.date)}
                  </time>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
