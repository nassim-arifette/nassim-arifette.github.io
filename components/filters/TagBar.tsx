'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

type TagBarProps = {
  tags: string[]
  counts?: Map<string, number>
  active: string[]
  onToggle: (tag: string) => void
  onClear?: () => void
  topN?: number
  label?: string
}

export function TagBar({
  tags,
  counts,
  active,
  onToggle,
  onClear,
  topN = 6,
  label = 'Filter by tag',
}: TagBarProps) {
  const labelId = useId()
  const panelId = useId()
  const searchId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => moreButtonRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => searchRef.current?.focus())
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !moreButtonRef.current?.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeAndRestoreFocus()
      }
    }
    document.addEventListener('mousedown', handleDocumentClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('mousedown', handleDocumentClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeAndRestoreFocus, open])

  const normalize = (value: string) =>
    value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => {
      const countA = counts?.get(a) ?? 0
      const countB = counts?.get(b) ?? 0
      return countB - countA || a.localeCompare(b)
    })
  }, [tags, counts])

  const filteredPanelTags = useMemo(
    () => (query ? sortedTags.filter((tag) => normalize(tag).includes(normalize(query))) : sortedTags),
    [sortedTags, query],
  )

  const pinned = active.filter((tag) => sortedTags.includes(tag))
  const topPool = sortedTags.filter((tag) => !pinned.includes(tag))
  const inline = [...pinned, ...topPool.slice(0, Math.max(topN - pinned.length, 0))]
  const inlineSet = new Set(inline)
  const moreCount = sortedTags.length - inlineSet.size

  const Chip = ({ tag }: { tag: string }) => {
    const selected = active.includes(tag)
    const count = counts?.get(tag)
    return (
      <button
        type="button"
        onClick={() => onToggle(tag)}
        className={`inline-flex min-h-9 items-center justify-center border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] transition-colors [@media(pointer:coarse)]:min-h-12 [@media(pointer:coarse)]:min-w-12 [@media(pointer:coarse)]:px-4 [@media(pointer:coarse)]:py-2 ${
          selected
            ? 'border-signal bg-signal text-background'
            : 'border-border bg-transparent text-muted-foreground hover:border-signal hover:text-foreground'
        }`}
        aria-pressed={selected}
      >
        {tag}
        {typeof count === 'number' ? <span className="ml-1 opacity-70">({count})</span> : null}
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-labelledby={labelId}>
      <span className="sr-only" id={labelId}>
        {label}
      </span>

      {inline.map((tag) => (
        <Chip key={`chip-${tag}`} tag={tag} />
      ))}

      {moreCount > 0 && (
        <div className="relative">
          <button
            ref={moreButtonRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${label}. Show ${moreCount} more tags`}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex min-h-9 items-center justify-center border border-border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-signal hover:text-foreground [@media(pointer:coarse)]:min-h-12 [@media(pointer:coarse)]:min-w-12 [@media(pointer:coarse)]:px-4 [@media(pointer:coarse)]:py-2"
            title="Show all tags"
          >
            +{moreCount} more
          </button>

          {open && (
            <div
              id={panelId}
              ref={panelRef}
              role="dialog"
              aria-label="All tags"
              className="fixed inset-x-4 bottom-4 z-50 flex max-h-[calc(100dvh-2rem)] flex-col border border-border bg-popover p-3 shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 sm:max-h-[min(24rem,calc(100dvh-8rem))]"
            >
              <label htmlFor={searchId} className="sr-only">
                Search all tags
              </label>
              <input
                id={searchId}
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tags..."
                className="h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-signal"
              />
              <div className="mt-2 min-h-0 flex-1 overflow-auto pr-1">
                {filteredPanelTags.length === 0 ? (
                  <p className="p-2 text-sm text-muted-foreground">No matching tags.</p>
                ) : (
                  filteredPanelTags.map((tag) => {
                    const selected = active.includes(tag)
                    const count = counts?.get(tag)
                    return (
                      <label
                        key={`row-${tag}`}
                        className="flex min-h-11 cursor-pointer items-center gap-2 px-2 py-1 text-sm hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => onToggle(tag)}
                          className="h-4 w-4"
                        />
                        <span>{tag}</span>
                        {typeof count === 'number' ? (
                          <span className="ml-auto text-xs text-muted-foreground">{count}</span>
                        ) : null}
                      </label>
                    )
                  })
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                {onClear ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClear()
                      setQuery('')
                    }}
                    className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Clear all
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={closeAndRestoreFocus}
                    className="min-h-11 border border-border px-3 py-1.5 text-sm hover:bg-accent [@media(pointer:coarse)]:min-h-12"
                  >
                    Close filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
