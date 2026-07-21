'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { researchThemes, type ResearchTheme } from '../lib/research-themes'

type DiagramTheme = ResearchTheme & {
  position: string
  side: 'left' | 'right'
  path: string
}

const diagramLayout: Array<Pick<DiagramTheme, 'position' | 'side' | 'path'>> = [
  {
    position: 'left-[4%] top-[12%]',
    side: 'left',
    path: 'M 49 31 C 44 24, 41 18, 37 14',
  },
  {
    position: 'right-[4%] top-[12%]',
    side: 'right',
    path: 'M 51 31 C 56 24, 59 18, 63 14',
  },
  {
    position: 'left-[4%] bottom-[12%]',
    side: 'left',
    path: 'M 49 31 C 44 38, 41 44, 37 48',
  },
  {
    position: 'right-[4%] bottom-[12%]',
    side: 'right',
    path: 'M 51 31 C 56 38, 59 44, 63 48',
  },
]

const diagramThemes: DiagramTheme[] = researchThemes.map((theme, index) => ({
  ...theme,
  ...diagramLayout[index],
}))

function nodeClasses(theme: DiagramTheme, isActive: boolean) {
  const orientation =
    theme.side === 'left' ? 'flex-row-reverse text-right' : 'flex-row text-left'

  return [
    'group absolute z-10 flex w-[40%] items-center gap-3 py-2',
    'focus-visible:outline-none focus-visible:[&_.node-mark]:ring-2',
    'focus-visible:[&_.node-mark]:ring-signal focus-visible:[&_.node-mark]:ring-offset-4',
    'focus-visible:[&_.node-mark]:ring-offset-background',
    orientation,
    theme.position,
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
  ].join(' ')
}

export function ResearchMap() {
  const [activeId, setActiveId] = useState(researchThemes[0].id)
  const captionId = useId()
  const activeTheme =
    researchThemes.find((theme) => theme.id === activeId) ?? researchThemes[0]

  return (
    <figure
      className="w-full border-y border-border bg-background"
      aria-labelledby="research-map-title"
      aria-describedby={captionId}
    >
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-1 py-3">
        <h2 id="research-map-title" className="font-serif text-base tracking-tight sm:text-lg">
          <span className="mr-2 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Figure 1
          </span>
          Map of selected work
        </h2>
        <p className="hidden text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground sm:block">
          Select a question
        </p>
      </header>

      <div
        className="relative hidden min-h-[29rem] overflow-hidden md:block"
        role="group"
        aria-label="Research themes"
      >
        <svg
          className="absolute inset-0 h-full w-full text-border"
          viewBox="0 0 100 62"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M 50 4 V 58" stroke="currentColor" strokeWidth="0.12" opacity="0.5" />
          <path d="M 8 31 H 92" stroke="currentColor" strokeWidth="0.12" opacity="0.5" />
          <ellipse
            cx="50"
            cy="31"
            rx="31"
            ry="19"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.22"
            strokeDasharray="1.1 1.4"
          />
          <ellipse
            cx="50"
            cy="31"
            rx="22"
            ry="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.16"
            strokeDasharray="0.7 1.8"
            opacity="0.72"
          />

          {diagramThemes.map((theme) => (
            <g key={theme.id}>
              <path
                d={theme.path}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.28"
                strokeDasharray="0.8 1.1"
              />
              <path
                d={theme.path}
                fill="none"
                stroke="oklch(var(--signal))"
                strokeWidth="0.48"
                className={
                  activeId === theme.id
                    ? 'opacity-100 transition-opacity duration-300 motion-reduce:transition-none'
                    : 'opacity-0 transition-opacity duration-300 motion-reduce:transition-none'
                }
              />
            </g>
          ))}

          <g fill="currentColor" opacity="0.8">
            <circle cx="23" cy="31" r="0.38" />
            <circle cx="29" cy="9" r="0.25" />
            <circle cx="31" cy="52" r="0.28" />
            <circle cx="69" cy="10" r="0.32" />
            <circle cx="76" cy="31" r="0.24" />
            <circle cx="68" cy="53" r="0.3" />
          </g>
        </svg>

        <div
          className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/70 bg-background p-5 text-center"
          aria-hidden="true"
        >
          <p className="font-serif text-base leading-snug">
            Questions
            <span className="block text-muted-foreground">into systems</span>
          </p>
        </div>

        {diagramThemes.map((theme) => {
          const isActive = theme.id === activeId
          const [firstLine, secondLine] = theme.diagramTitle.split('\n')

          return (
            <button
              key={theme.id}
              type="button"
              data-research-theme={theme.id}
              data-layout="diagram"
              aria-pressed={isActive}
              aria-controls={captionId}
              className={nodeClasses(theme, isActive)}
              onClick={() => setActiveId(theme.id)}
            >
              <span
                className={[
                  'node-mark relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-background',
                  'text-[0.62rem] font-semibold tabular-nums tracking-[0.08em]',
                  'transition-transform duration-200 motion-reduce:transition-none',
                  'group-hover:scale-[1.04] group-active:scale-95 motion-reduce:transform-none',
                  isActive
                    ? 'border-signal text-signal'
                    : 'border-border text-muted-foreground',
                ].join(' ')}
                aria-hidden="true"
              >
                {theme.number}
                <span
                  className={[
                    'absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background',
                    isActive ? 'bg-signal' : 'bg-border',
                  ].join(' ')}
                />
              </span>
              <span className="font-serif text-[clamp(0.9rem,1.45vw,1.08rem)] leading-tight">
                <span>{firstLine}</span>
                {secondLine ? <span className="block">{secondLine}</span> : null}
              </span>
            </button>
          )
        })}
      </div>

      <ol
        className="divide-y divide-border md:hidden"
        aria-label="Research themes"
      >
        {researchThemes.map((theme) => {
          const isActive = theme.id === activeId

          return (
            <li key={theme.id}>
              <button
                type="button"
                data-research-theme={theme.id}
                data-layout="list"
                aria-pressed={isActive}
                aria-controls={captionId}
                className={[
                  'grid min-h-14 w-full grid-cols-[2.25rem_1fr_auto] items-center gap-3 py-3 text-left',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                ].join(' ')}
                onClick={() => setActiveId(theme.id)}
              >
                <span
                  className={[
                    'text-xs font-semibold tabular-nums',
                    isActive ? 'text-signal' : 'text-muted-foreground',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {theme.number}
                </span>
                <span className="font-serif text-base leading-tight">{theme.title}</span>
                <span
                  className={[
                    'h-2.5 w-2.5 rounded-full border',
                    isActive
                      ? 'border-signal bg-signal'
                      : 'border-muted-foreground bg-transparent',
                  ].join(' ')}
                  aria-hidden="true"
                />
              </button>
            </li>
          )
        })}
      </ol>

      <figcaption
        id={captionId}
        className="grid gap-5 border-t border-border py-5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-8"
      >
        <div className="flex items-baseline gap-2 sm:block">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Selected question
          </p>
          <p className="mt-2 hidden font-serif text-2xl tabular-nums text-signal sm:block">
            {activeTheme.number}
          </p>
        </div>

        <div className="min-w-0">
          <h3 className="font-serif text-xl leading-tight sm:text-2xl">{activeTheme.title}</h3>
          <p className="mt-2 max-w-[62ch] text-base leading-relaxed text-foreground">
            {activeTheme.question}
          </p>
          <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
            {activeTheme.note}
          </p>
          <nav
            className="mt-4 flex flex-wrap gap-x-5 gap-y-2"
            aria-label={`Projects related to ${activeTheme.title}`}
          >
            {activeTheme.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center gap-1 border-b border-border text-sm font-medium text-foreground transition-colors hover:border-signal hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
              >
                {link.label}
                <span aria-hidden="true">&#8599;</span>
              </Link>
            ))}
          </nav>
        </div>
      </figcaption>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Selected theme: {activeTheme.title}. {activeTheme.question}
      </p>
    </figure>
  )
}
