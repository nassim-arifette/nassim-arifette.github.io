'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

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
  topN = 12,
  label = 'Filter by tag',
}: TagBarProps) {
  const labelId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleDocumentClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleDocumentClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

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
        className={`rounded-full border px-3 py-1 text-xs transition ${
          selected
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-muted text-muted-foreground hover:border-foreground/50 hover:text-foreground'
        }`}
        aria-pressed={selected}
      >
        {tag}
        {typeof count === 'number' ? <span className="ml-1 opacity-70">({count})</span> : null}
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sr-only" id={labelId}>
        {label}
      </span>

      {inline.map((tag) => (
        <Chip key={`chip-${tag}`} tag={tag} />
      ))}

      {moreCount > 0 && (
        <div className="relative">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-labelledby={labelId}
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-foreground/50 hover:text-foreground"
            title="Show all tags"
          >
            +{moreCount} more
          </button>

          {open && (
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="All tags"
              className="absolute right-0 z-50 mt-2 w-72 rounded-lg border bg-background p-3 shadow-lg"
            >
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tags..."
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <div className="mt-2 max-h-64 overflow-auto pr-1">
                {filteredPanelTags.length === 0 ? (
                  <p className="p-2 text-sm text-muted-foreground">No matching tags.</p>
                ) : (
                  filteredPanelTags.map((tag) => {
                    const selected = active.includes(tag)
                    const count = counts?.get(tag)
                    return (
                      <label
                        key={`row-${tag}`}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
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
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Clear all
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
