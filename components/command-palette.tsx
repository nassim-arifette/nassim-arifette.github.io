"use client"

import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { allPosts, allProjects } from 'contentlayer/generated'
import { normalizeText } from '@/lib/search'
import { slugifyTag } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
}

type CommandEntry = {
  id: string
  group: string
  label: string
  href: string
  description?: string
  info?: string
  keywords: string
  badges?: string[]
}

type GroupedEntries = {
  group: string
  items: CommandEntry[]
}

type CommandPaletteProps = {
  navItems: NavItem[]
}

export function CommandPalette({ navItems }: CommandPaletteProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLButtonElement | null>(null)

  const postEntries = useMemo(() => {
    return allPosts
      .filter((post) => post.published !== false)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .map<CommandEntry>((post) => ({
        id: `post:${post.slug}`,
        group: 'Posts',
        label: post.title,
        href: post.url,
        description: post.description,
        info: new Date(post.date).toLocaleDateString(),
        badges: (post.tags ?? []).slice(0, 3),
        keywords: normalizeText(
          [post.title, post.description, ...(post.tags ?? []), new Date(post.date).toLocaleDateString()].join(' '),
        ),
      }))
  }, [])

  const projectEntries = useMemo(() => {
    return allProjects
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .map<CommandEntry>((project) => ({
        id: `project:${project.slug}`,
        group: 'Projects',
        label: project.title,
        href: project.url,
        description: project.description,
        info: new Date(project.date).toLocaleDateString(),
        badges: (project.tags ?? []).slice(0, 3),
        keywords: normalizeText(
          [project.title, project.description, ...(project.tags ?? []), new Date(project.date).toLocaleDateString()].join(
            ' ',
          ),
        ),
      }))
  }, [])

  const tagEntries = useMemo(() => {
    const counts = new Map<string, { label: string; posts: number; projects: number }>()

    for (const post of allPosts) {
      if (post.published === false) continue
      for (const rawTag of post.tags ?? []) {
        const tag = rawTag.trim()
        if (!tag) continue
        const slug = slugifyTag(tag)
        if (!counts.has(slug)) {
          counts.set(slug, { label: tag, posts: 0, projects: 0 })
        }
        const entry = counts.get(slug)!
        entry.label ||= tag
        entry.posts += 1
      }
    }

    for (const project of allProjects) {
      for (const rawTag of project.tags ?? []) {
        const tag = rawTag.trim()
        if (!tag) continue
        const slug = slugifyTag(tag)
        if (!counts.has(slug)) {
          counts.set(slug, { label: tag, posts: 0, projects: 0 })
        }
        const entry = counts.get(slug)!
        entry.label ||= tag
        entry.projects += 1
      }
    }

    return Array.from(counts.values())
      .sort((a, b) => a.label.localeCompare(b.label))
      .map<CommandEntry>((entry) => {
        const slug = slugifyTag(entry.label)
        const total = entry.posts + entry.projects
        const descriptionParts = []
        if (entry.posts) descriptionParts.push(`${entry.posts} post${entry.posts === 1 ? '' : 's'}`)
        if (entry.projects) descriptionParts.push(`${entry.projects} project${entry.projects === 1 ? '' : 's'}`)
        return {
          id: `tag:${slug}`,
          group: 'Tags',
          label: entry.label,
          href: `/tags/${slug}`,
          description: descriptionParts.join(' • ') || `${total} item${total === 1 ? '' : 's'}`,
          keywords: normalizeText([entry.label, descriptionParts.join(' ')].join(' ')),
        }
      })
  }, [])

  const pageEntries = useMemo(() => {
    return navItems.map<CommandEntry>((item) => ({
      id: `page:${item.href}`,
      group: 'Pages',
      label: item.label,
      href: item.href,
      keywords: normalizeText(`${item.label} ${item.href}`),
      description: item.href === '/' ? 'Home page' : item.label,
    }))
  }, [navItems])

  const allEntries = useMemo(() => [...pageEntries, ...postEntries, ...projectEntries, ...tagEntries], [
    pageEntries,
    postEntries,
    projectEntries,
    tagEntries,
  ])

  const normalizedQuery = useMemo(() => (query ? normalizeText(query) : ''), [query])

  const filteredEntries = useMemo(() => {
    if (!normalizedQuery) return allEntries
    return allEntries.filter((entry) => entry.keywords.includes(normalizedQuery))
  }, [allEntries, normalizedQuery])

  const groupedEntries = useMemo<GroupedEntries[]>(() => {
    const map = new Map<string, CommandEntry[]>()
    for (const entry of filteredEntries) {
      const existing = map.get(entry.group)
      if (existing) {
        existing.push(entry)
      } else {
        map.set(entry.group, [entry])
      }
    }
    return Array.from(map.entries()).map(([group, items]) => ({ group, items }))
  }, [filteredEntries])

  const indexMap = useMemo(() => {
    const map = new Map<string, number>()
    filteredEntries.forEach((entry, index) => {
      map.set(entry.id, index)
    })
    return map
  }, [filteredEntries])

  const activeEntryId = filteredEntries[activeIndex]?.id ?? null

  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setQuery('')
    setActiveIndex(0)
    resultsContainerRef.current?.scrollTo({ top: 0 })
    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setActiveIndex(0)
  }, [normalizedQuery, open])

  useEffect(() => {
    if (activeIndex >= filteredEntries.length) {
      setActiveIndex(filteredEntries.length > 0 ? filteredEntries.length - 1 : 0)
    }
  }, [filteredEntries.length, activeIndex])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      const container = resultsContainerRef.current
      const element = activeItemRef.current
      if (!container || !element) return
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      if (elementRect.top < containerRect.top) {
        container.scrollBy({ top: elementRect.top - containerRect.top, behavior: 'smooth' })
      } else if (elementRect.bottom > containerRect.bottom) {
        container.scrollBy({ top: elementRect.bottom - containerRect.bottom, behavior: 'smooth' })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [activeEntryId, open])

  useEffect(() => {
    if (open) return
    activeItemRef.current = null
    if (lastFocusedRef.current) {
      lastFocusedRef.current.focus({ preventScroll: true })
      lastFocusedRef.current = null
    }
  }, [open])

  const closePalette = useCallback(() => {
    setOpen(false)
  }, [])

  const openPalette = useCallback(() => {
    lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setOpen(true)
  }, [])

  useEffect(() => {
    const handleGlobalKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => {
          if (current) {
            return false
          }
          lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
          return true
        })
      } else if (event.key === 'Escape' && open) {
        event.preventDefault()
        closePalette()
      }
    }

    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [closePalette, open])

  const handleSelect = useCallback(
    (entry: CommandEntry) => {
      closePalette()
      router.push(entry.href)
    },
    [closePalette, router],
  )

  const handleResultKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (filteredEntries.length === 0) return
    if (event.key === 'ArrowDown' || (event.key.toLowerCase() === 'j' && !event.metaKey && !event.ctrlKey)) {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, filteredEntries.length - 1))
    } else if (event.key === 'ArrowUp' || (event.key.toLowerCase() === 'k' && !event.metaKey && !event.ctrlKey)) {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const entry = filteredEntries[activeIndex]
      if (entry) {
        handleSelect(entry)
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      closePalette()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (open) {
            closePalette()
          } else {
            openPalette()
          }
        }}
        className="hidden h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground transition hover:border-foreground/40 hover:text-foreground lg:flex"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Search
        <span className="hidden items-center gap-1 text-xs text-muted-foreground/70 sm:flex">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">⌘</kbd>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">K</kbd>
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm px-4 py-24 sm:py-32"
          onClick={closePalette}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border/80 p-3">
              <label htmlFor="command-search" className="sr-only">
                Search site
              </label>
              <input
                id="command-search"
                ref={inputRef}
                type="search"
                placeholder="Search posts, projects, tags…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleResultKeyDown}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div ref={resultsContainerRef} className="max-h-80 overflow-y-auto">
              {filteredEntries.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">No matches found.</p>
              ) : (
                groupedEntries.map(({ group, items }) => (
                  <div key={group}>
                    <p className="px-4 pt-4 pb-2 text-xs font-medium uppercase text-muted-foreground/80">{group}</p>
                    <ul className="px-2 pb-2">
                      {items.map((item) => {
                        const index = indexMap.get(item.id) ?? 0
                        const active = index === activeIndex
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => handleSelect(item)}
                              className={`w-full rounded-md px-3 py-2 text-left transition ${
                                active ? 'bg-muted text-foreground' : 'hover:bg-accent'
                              }`}
                              onMouseEnter={() => setActiveIndex(index)}
                              ref={(element) => {
                                if (active) {
                                  activeItemRef.current = element
                                } else if (activeItemRef.current === element) {
                                  activeItemRef.current = null
                                }
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-sm font-medium leading-tight">{item.label}</span>
                                {item.info ? <span className="text-xs text-muted-foreground">{item.info}</span> : null}
                              </div>
                              {item.description ? (
                                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                              ) : null}
                              {item.badges && item.badges.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {item.badges.map((badge) => (
                                    <span
                                      key={badge}
                                      className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                                    >
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border/80 px-4 py-2 text-xs text-muted-foreground">
              <span>J/K or ↑/↓ to navigate • Enter to open</span>
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
