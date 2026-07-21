"use client"

import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { normalizeText } from '@/lib/search'
import type { CommandSearchEntry } from '@/lib/content-projections'

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
  contentEntries: CommandSearchEntry[]
}

const getOptionId = (entryId: string) => `command-option-${entryId.replace(/[^a-zA-Z0-9_-]/g, '-')}`
const getGroupId = (group: string) => `command-group-${group.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`

export function CommandPalette({ navItems, contentEntries }: CommandPaletteProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasMounted, setHasMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLButtonElement | null>(null)
  const dialogId = useId()
  const titleId = useId()
  const descriptionId = useId()
  const resultsId = useId()

  useEffect(() => {
    setHasMounted(true)
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

  const allEntries = useMemo(
    () => [...pageEntries, ...contentEntries],
    [pageEntries, contentEntries],
  )

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
  const activeOptionId = activeEntryId ? getOptionId(activeEntryId) : undefined

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setQuery('')
    setActiveIndex(0)
    resultsContainerRef.current?.scrollTo({ top: 0 })
    return () => {
      cancelAnimationFrame(frame)
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
      const behavior: ScrollBehavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth'

      if (elementRect.top < containerRect.top) {
        container.scrollBy({ top: elementRect.top - containerRect.top, behavior })
      } else if (elementRect.bottom > containerRect.bottom) {
        container.scrollBy({ top: elementRect.bottom - containerRect.bottom, behavior })
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
          if (current) return false
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
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, filteredEntries.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const entry = filteredEntries[activeIndex]
      if (entry) handleSelect(entry)
    }
  }

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closePalette()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'input:not([disabled]), button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"])',
      ) ?? [],
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (open ? closePalette() : openPalette())}
        className="hidden h-10 w-auto items-center justify-center gap-2 border border-border px-3 text-sm text-muted-foreground transition hover:border-foreground/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [@media(pointer:coarse)]:h-12 lg:inline-flex"
        aria-label="Search site"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
      >
        <Search aria-hidden="true" size={16} />
        <span className="sr-only lg:not-sr-only">Search</span>
        <span aria-hidden="true" className="hidden items-center text-[11px] text-muted-foreground/70 xl:flex">
          <kbd className="border border-border bg-muted px-1.5 py-0.5 font-sans">Ctrl K</kbd>
        </span>
      </button>

      {hasMounted && open
        ? createPortal(
            <div
              id={dialogId}
              className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-background/85 p-4 backdrop-blur-sm sm:items-center sm:p-8"
              onClick={closePalette}
              onKeyDown={handleDialogKeyDown}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
            >
              <div
                ref={dialogRef}
                className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden border border-border bg-card shadow-xl sm:max-h-[calc(100dvh-4rem)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="border-b border-border/80 p-4">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Site index
                      </p>
                      <h2 id={titleId} className="mt-1 text-lg font-semibold text-foreground">
                        Search the site
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={closePalette}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-border text-muted-foreground transition hover:border-foreground/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [@media(pointer:coarse)]:h-12 [@media(pointer:coarse)]:w-12"
                      aria-label="Close search"
                    >
                      <X aria-hidden="true" size={17} />
                    </button>
                  </div>
                  <p id={descriptionId} className="sr-only">
                    Search pages, research notes, and projects. Use the arrow keys to review results and Enter to open one.
                  </p>
                  <label htmlFor="command-search" className="sr-only">
                    Search query
                  </label>
                  <input
                    id="command-search"
                    ref={inputRef}
                    type="search"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded="true"
                    aria-controls={resultsId}
                    aria-activedescendant={activeOptionId}
                    placeholder="Search notes, projects, and pages..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={handleResultKeyDown}
                    className="h-11 w-full border-0 border-b border-border bg-transparent px-0 text-base outline-none transition focus:border-foreground focus-visible:ring-0"
                  />
                </div>

                <div
                  id={resultsId}
                  ref={resultsContainerRef}
                  role="listbox"
                  aria-label="Search results"
                  className="min-h-0 flex-1 overflow-y-auto"
                >
                  {filteredEntries.length === 0 ? (
                    <p className="px-4 py-8 text-sm text-muted-foreground" role="status">
                      No pages, notes, or projects match that search.
                    </p>
                  ) : (
                    groupedEntries.map(({ group, items }) => {
                      const groupId = getGroupId(group)
                      return (
                        <div key={group} role="group" aria-labelledby={groupId}>
                          <p
                            id={groupId}
                            className="border-b border-border/60 px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                          >
                            {group}
                          </p>
                          <ul className="divide-y divide-border/60" role="presentation">
                            {items.map((item) => {
                              const index = indexMap.get(item.id) ?? 0
                              const active = index === activeIndex
                              return (
                                <li key={item.id} role="presentation">
                                  <button
                                    id={getOptionId(item.id)}
                                    type="button"
                                    role="option"
                                    aria-selected={active}
                                    tabIndex={-1}
                                    onClick={() => handleSelect(item)}
                                    className={`min-h-11 w-full px-4 py-3 text-left transition ${
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
                                    <div className="flex items-start justify-between gap-4">
                                      <span className="text-sm font-medium leading-tight">{item.label}</span>
                                      {item.info ? (
                                        <span className="shrink-0 text-xs text-muted-foreground">{item.info}</span>
                                      ) : null}
                                    </div>
                                    {item.description ? (
                                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        {item.description}
                                      </p>
                                    ) : null}
                                    {item.badges && item.badges.length > 0 ? (
                                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                        {item.badges.map((badge) => (
                                          <span
                                            key={badge}
                                            className="text-[11px] uppercase tracking-wide text-muted-foreground"
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
                      )
                    })
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-border/80 px-4 py-2 text-xs text-muted-foreground">
                  <span className="sm:hidden">Tap a result to open it</span>
                  <span className="hidden sm:inline">Arrow keys to navigate · Enter to open</span>
                  <span className="hidden sm:inline">Esc to close</span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
