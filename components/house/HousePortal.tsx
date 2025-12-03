'use client'

import { useMemo, useState } from 'react'
import { Map, Sparkles } from 'lucide-react'
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
      <div className="rounded-2xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">3D house</p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">Enter the interactive house</h2>
              <span className="rounded-full border border-amber-300/50 bg-amber-200/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-200">
                Beta
              </span>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Walk a small 3D house with your keyboard. Projects live in the main hall; hackathon trophies are in the
              trophy wing. Use WASD / ZQSD or arrow keys to move, mouse to look, Enter to open the nearest card.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg transition hover:opacity-90"
            >
              <Sparkles size={16} />
              Enter 3D House
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
            <span className="rounded-full border border-border px-3 py-1">WASD / arrows to move</span>
            <span className="rounded-full border border-border px-3 py-1">Mouse look (click inside)</span>
            <span className="rounded-full border border-border px-3 py-1">Enter / Space to open nearest</span>
            <span className="rounded-full border border-border px-3 py-1">Esc to exit</span>
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
              document.exitPointerLock?.()
            }}
          />
        </div>
      ) : null}
    </section>
  )
}
