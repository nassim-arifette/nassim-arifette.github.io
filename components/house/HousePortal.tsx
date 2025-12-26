'use client'

import { useMemo, useState } from 'react'
import { Gamepad2, Map, Sprout } from 'lucide-react'
import { HouseGame } from './HouseGame'

type HouseNode = {
  slug: string
  title: string
  description: string
  url: string
  tags?: string[]
  placement?: string
  winner?: boolean
  date?: string
}

type HousePortalProps = {
  projects: HouseNode[]
  hackathons: HouseNode[]
}

export function HousePortal({ projects, hackathons }: HousePortalProps) {
  const [open, setOpen] = useState(false)
  const hasContent = useMemo(() => projects.length + hackathons.length > 0, [projects.length, hackathons.length])

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 shadow-xl dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Mini game</p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">Tiny world</h2>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-300/40 dark:bg-emerald-200/10 dark:text-emerald-200">
                Prototype
              </span>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Walk into a one-room house to browse projects and trophies, then step outside into a small garden where you
              can plant. It&apos;s lightweight and runs fully in the browser.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg transition hover:opacity-90"
              disabled={!hasContent}
              aria-disabled={!hasContent}
            >
              <Gamepad2 size={16} />
              Play
            </button>
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-foreground/60"
            >
              <Map size={16} />
              Skip to list
            </a>
          </div>
        </div>

        {!hasContent ? (
          <p className="mt-3 text-xs text-muted-foreground">No content loaded yet.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1">WASD / ZQSD / arrows</span>
            <span className="rounded-full border border-border px-3 py-1">Enter to open</span>
            <span className="rounded-full border border-border px-3 py-1">Space / click to plant</span>
            <span className="rounded-full border border-border px-3 py-1">
              <Sprout size={14} className="mr-1 inline" />
              Garden outside
            </span>
          </div>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm">
          <HouseGame
            projects={projects}
            hackathons={hackathons}
            onExit={() => {
              setOpen(false)
            }}
          />
        </div>
      ) : null}
    </section>
  )
}
