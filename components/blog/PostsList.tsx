'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Post } from 'contentlayer/generated'
import { TagBar } from '@/components/filters/TagBar'
import { normalizeText } from '@/lib/search'

type PostsListProps = {
  posts: Post[]
}

const arraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

export function PostsList({ posts }: PostsListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [tagMode, setTagMode] = useState<'AND' | 'OR'>('AND')
  const [activeIndex, setActiveIndex] = useState(-1)

  const hasHydrated = useRef(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  const indexedPosts = useMemo(() => {
    return posts.map((post) => ({
      ref: post,
      haystack: normalizeText([post.title, post.description, ...(post.tags ?? [])].join(' ')),
    }))
  }, [posts])

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
        const matchesTags =
          activeTags.length === 0 ||
          (tagMode === 'AND'
            ? activeTags.every((tag) => postTags.includes(tag))
            : activeTags.some((tag) => postTags.includes(tag)))

        if (!matchesTags) {
          return false
        }

        if (!normalizedQuery) {
          return true
        }

        return haystack.includes(normalizedQuery)
      })
      .map((entry) => entry.ref)
  }, [indexedPosts, activeTags, normalizedQuery, tagMode])

  const filteredPostsRef = useRef(filteredPosts)

  useEffect(() => {
    filteredPostsRef.current = filteredPosts
    setActiveIndex((current) => {
      if (filteredPosts.length === 0) return -1
      if (current < 0) return current
      return Math.min(current, filteredPosts.length - 1)
    })
  }, [filteredPosts])

  useEffect(() => {
    setActiveIndex(-1)
  }, [normalizedQuery, activeTags, tagMode])

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const isEditable =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.hasAttribute('contenteditable')

      const results = filteredPostsRef.current

      if (event.key === '/') {
        if (isEditable && target !== searchInputRef.current) return
        event.preventDefault()
        if (document.activeElement === searchInputRef.current && query) {
          setQuery('')
        } else {
          searchInputRef.current?.focus()
          searchInputRef.current?.select()
        }
        return
      }

      const key = event.key.toLowerCase()
      if ((key === 'j' || key === 'k') && results.length > 0) {
        if (isEditable && target !== searchInputRef.current) return
        event.preventDefault()
        setActiveIndex((current) => {
          if (key === 'j') {
            if (current < 0) return 0
            return Math.min(current + 1, results.length - 1)
          }
          if (current < 0) return results.length - 1
          if (current <= 0) return 0
          return Math.max(current - 1, 0)
        })
        return
      }

      if (event.key === 'Enter' && results.length > 0) {
        if (isEditable && target !== searchInputRef.current) return
        event.preventDefault()
        const selected = results[activeIndex] ?? results[0]
        if (selected) {
          router.push(selected.url)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, router, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex flex-col">
            <label htmlFor="posts-search" className="sr-only">
              Search posts
            </label>
            <input
              id="posts-search"
              type="search"
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts..."
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
          label="Filter posts by tag"
        />
      )}
      <div aria-live="polite">
        {filteredPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts match your filters.</p>
        ) : (
          <ul className="space-y-6">
            {filteredPosts.map((post, index) => {
              const selected = index === activeIndex
              return (
                <li key={post.slug} className="group">
                  <Link
                    href={post.url}
                    className={`block rounded-md border border-transparent px-4 py-3 transition hover:border-foreground/40 hover:bg-muted/80 ${
                      selected ? 'border-foreground/60 bg-muted' : ''
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex((current) => (current === index ? -1 : current))}
                  >
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-xl font-medium group-hover:underline">{post.title}</h2>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{post.description}</p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
