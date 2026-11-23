'use client'

import * as React from 'react'

// Diagrams for the self-study mathematics guide. Monochrome on purpose: they
// should read like figures in a book, not like a dashboard.

type Subject = { id: string; label: string; optional?: boolean }

// Columns are levels; the order inside a column is chosen to keep edges short.
const columns: { title: string; note: string; subjects: Subject[] }[] = [
  { title: 'Level 0', note: 'before', subjects: [{ id: 'precalculus', label: 'Prerequisites' }] },
  {
    title: 'Level 1',
    note: 'first year',
    subjects: [
      { id: 'calculus-1', label: 'Calculus I' },
      { id: 'linear-algebra-1', label: 'Linear algebra I' },
      { id: 'proofs', label: 'Proofs' },
      { id: 'discrete', label: 'Discrete maths', optional: true },
    ],
  },
  {
    title: 'Level 2',
    note: 'second year',
    subjects: [
      { id: 'calculus-2', label: 'Calculus II' },
      { id: 'probability', label: 'Probability' },
      { id: 'odes', label: 'ODEs' },
      { id: 'analysis-1', label: 'Real analysis' },
      { id: 'linear-algebra-2', label: 'Linear algebra II' },
      { id: 'algebra-1', label: 'Algebra I' },
    ],
  },
  {
    title: 'Level 3',
    note: 'third year',
    subjects: [
      { id: 'complex', label: 'Complex analysis' },
      { id: 'dynamics', label: 'Dynamical systems', optional: true },
      { id: 'analysis-2', label: 'Function spaces' },
      { id: 'topology', label: 'Topology' },
      { id: 'algebra-2', label: 'Algebra II' },
      { id: 'number-theory', label: 'Number theory', optional: true },
    ],
  },
  {
    title: 'Level 4',
    note: 'graduate doorway',
    subjects: [
      { id: 'pdes', label: 'PDEs' },
      { id: 'probability-2', label: 'Probability II', optional: true },
      { id: 'measure', label: 'Measure' },
      { id: 'functional', label: 'Functional analysis' },
      { id: 'differential-geometry', label: 'Differential geom.' },
      { id: 'algebraic-topology', label: 'Algebraic topology', optional: true },
      { id: 'numerical', label: 'Numerical analysis', optional: true },
      { id: 'logic', label: 'Logic', optional: true },
    ],
  },
]

// prerequisite -> subject
const edges: [string, string][] = [
  ['precalculus', 'calculus-1'],
  ['precalculus', 'linear-algebra-1'],
  ['precalculus', 'proofs'],
  ['calculus-1', 'calculus-2'],
  ['calculus-1', 'odes'],
  ['linear-algebra-1', 'odes'],
  ['linear-algebra-1', 'linear-algebra-2'],
  ['proofs', 'linear-algebra-2'],
  ['proofs', 'analysis-1'],
  ['proofs', 'algebra-1'],
  ['calculus-2', 'analysis-1'],
  ['calculus-2', 'probability'],
  ['calculus-2', 'complex'],
  ['analysis-1', 'complex'],
  ['analysis-1', 'analysis-2'],
  ['analysis-1', 'topology'],
  ['linear-algebra-2', 'analysis-2'],
  ['linear-algebra-2', 'algebra-2'],
  ['algebra-1', 'algebra-2'],
  ['algebra-1', 'number-theory'],
  ['odes', 'dynamics'],
  ['odes', 'pdes'],
  ['analysis-2', 'pdes'],
  ['analysis-2', 'measure'],
  ['analysis-2', 'functional'],
  ['analysis-2', 'differential-geometry'],
  ['topology', 'differential-geometry'],
  ['topology', 'algebraic-topology'],
  ['algebra-2', 'algebraic-topology'],
  ['probability', 'probability-2'],
  ['linear-algebra-2', 'numerical'],
  ['algebra-1', 'logic'],
]

const W = 860
const COL = W / columns.length
const NODE_W = 150
const NODE_H = 30
const ROW = 44
const TOP = 52
const maxRows = Math.max(...columns.map((c) => c.subjects.length))
const H = TOP + maxRows * ROW + 8

const positions = new Map<string, { x: number; y: number }>()
columns.forEach((column, i) => {
  const offset = ((maxRows - column.subjects.length) * ROW) / 2
  column.subjects.forEach((subject, j) => {
    positions.set(subject.id, { x: i * COL + (COL - NODE_W) / 2, y: TOP + offset + j * ROW })
  })
})

function prerequisitesOf(id: string) {
  const seen = new Set<string>([id])
  const stack = [id]
  while (stack.length) {
    const current = stack.pop()!
    for (const [from, to] of edges) {
      if (to === current && !seen.has(from)) {
        seen.add(from)
        stack.push(from)
      }
    }
  }
  return seen
}

/** The curriculum as a dependency graph. Hovering a subject lights up everything it rests on. */
export function DependencyMap() {
  const [active, setActive] = React.useState<string | null>(null)
  const lit = React.useMemo(() => (active ? prerequisitesOf(active) : null), [active])

  return (
    <figure className="not-prose my-10">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[720px]" role="img"
          aria-label="Dependency graph of the curriculum, from prerequisites to graduate subjects"
          onMouseLeave={() => setActive(null)}>
          {columns.map((column, i) => (
            <g key={column.title}>
              <text x={i * COL + COL / 2} y={16} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">
                {column.title}
              </text>
              <text x={i * COL + COL / 2} y={32} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                {column.note}
              </text>
            </g>
          ))}

          {edges.map(([from, to]) => {
            const a = positions.get(from)!
            const b = positions.get(to)!
            const x1 = a.x + NODE_W
            const y1 = a.y + NODE_H / 2
            const x2 = b.x
            const y2 = b.y + NODE_H / 2
            const mid = (x1 + x2) / 2
            const on = lit ? lit.has(from) && lit.has(to) : false
            return (
              <path key={`${from}-${to}`} d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`} fill="none"
                style={{
                  stroke: on ? 'oklch(var(--accent))' : 'oklch(var(--foreground))',
                  strokeOpacity: lit ? (on ? 1 : 0.08) : 0.28,
                  strokeWidth: on ? 1.6 : 1,
                  transition: 'stroke-opacity 200ms',
                }} />
            )
          })}

          {columns.flatMap((column) => column.subjects).map((subject) => {
            const { x, y } = positions.get(subject.id)!
            const on = lit?.has(subject.id)
            const dim = lit && !on ? 0.35 : 1
            return (
              <a key={subject.id} href={`#${subject.id}`} onMouseEnter={() => setActive(subject.id)}
                onFocus={() => setActive(subject.id)} onBlur={() => setActive(null)} className="outline-none">
                <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={4}
                  style={{
                    fill: active === subject.id ? 'oklch(var(--accent) / 0.12)' : 'oklch(var(--background))',
                    stroke: on ? 'oklch(var(--accent))' : 'oklch(var(--foreground) / 0.55)',
                    strokeDasharray: subject.optional ? '4 3' : undefined,
                    opacity: dim,
                    transition: 'opacity 200ms',
                  }} />
                <text x={x + NODE_W / 2} y={y + NODE_H / 2 + 4} textAnchor="middle" className="fill-foreground text-[12px]"
                  style={{ opacity: dim, transition: 'opacity 200ms' }}>
                  {subject.label}
                </text>
              </a>
            )
          })}
        </svg>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        An arrow means “is needed for”. Dashed boxes are optional. Hover a subject to light up everything it rests on,
        click it to jump to its section.
      </figcaption>
    </figure>
  )
}

// Rough schedules at about 10 hours a week: [section id, label, start month, end month].
const routes: Record<string, { name: string; rows: [string, string, number, number][] }> = {
  pure: {
    name: 'Pure mathematics',
    rows: [
      ['precalculus', 'Prerequisites', 0, 1],
      ['calculus-1', 'Calculus I', 1, 5],
      ['proofs', 'Proofs', 2, 5],
      ['linear-algebra-1', 'Linear algebra I', 3, 7],
      ['calculus-2', 'Calculus II', 5, 10],
      ['analysis-1', 'Real analysis', 9, 16],
      ['linear-algebra-2', 'Linear algebra II', 11, 15],
      ['algebra-1', 'Algebra I', 13, 18],
      ['odes', 'ODEs', 16, 19],
      ['probability', 'Probability', 18, 22],
      ['analysis-2', 'Function spaces', 21, 26],
      ['complex', 'Complex analysis', 24, 29],
      ['topology', 'Topology', 26, 30],
      ['algebra-2', 'Algebra II', 28, 35],
      ['measure', 'Measure', 34, 39],
      ['functional', 'Functional analysis', 38, 43],
      ['differential-geometry', 'Differential geometry', 41, 47],
      ['algebraic-topology', 'Algebraic topology', 44, 48],
    ],
  },
  ml: {
    name: 'Machine learning',
    rows: [
      ['precalculus', 'Prerequisites', 0, 1],
      ['calculus-1', 'Calculus I', 1, 5],
      ['proofs', 'Proofs', 2, 5],
      ['linear-algebra-1', 'Linear algebra I + SVD', 3, 8],
      ['calculus-2', 'Calculus II', 5, 10],
      ['probability', 'Probability', 9, 14],
      ['analysis-1', 'Real analysis', 12, 19],
      ['linear-algebra-2', 'Linear algebra II', 15, 19],
      ['analysis-2', 'Function spaces', 19, 23],
      ['measure', 'Measure', 22, 26],
      ['functional', 'Functional analysis', 25, 29],
      ['probability-2', 'Probability II', 26, 31],
      ['numerical', 'Numerical analysis', 28, 31],
    ],
  },
  physics: {
    name: 'Physics and engineering',
    rows: [
      ['precalculus', 'Prerequisites', 0, 1],
      ['calculus-1', 'Calculus I', 1, 5],
      ['linear-algebra-1', 'Linear algebra I', 3, 7],
      ['proofs', 'Proofs', 4, 7],
      ['calculus-2', 'Calculus II', 5, 10],
      ['odes', 'ODEs', 7, 11],
      ['analysis-1', 'Real analysis (Abbott)', 10, 15],
      ['complex', 'Complex analysis', 14, 18],
      ['dynamics', 'Dynamical systems', 16, 19],
      ['pdes', 'PDEs', 18, 23],
      ['functional', 'Functional analysis (Kreyszig)', 21, 25],
    ],
  },
}

/** A schedule as a Gantt chart, to show how much the subjects overlap. */
export function Timeline() {
  const [route, setRoute] = React.useState('pure')
  const { rows } = routes[route]
  const months = 48
  const LABEL = 200
  const ROW_H = 22
  const width = 860
  const scale = (width - LABEL - 10) / months
  const height = 28 + rows.length * ROW_H + 6

  return (
    <figure className="not-prose my-10">
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm" role="tablist" aria-label="Route">
        {Object.keys(routes).map((key) => (
          <button key={key} type="button" role="tab" aria-selected={route === key} onClick={() => setRoute(key)}
            className={route === key
              ? 'font-medium text-foreground underline decoration-accent decoration-2 underline-offset-[6px]'
              : 'text-muted-foreground hover:text-foreground'}>
            {routes[key].name}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[640px]" role="img"
          aria-label={`Schedule for the ${routes[route].name} route`}>
          {Array.from({ length: months / 12 + 1 }, (_, year) => {
            const x = LABEL + year * 12 * scale
            return (
              <g key={year}>
                <line x1={x} x2={x} y1={18} y2={height} style={{ stroke: 'oklch(var(--foreground) / 0.12)' }} />
                {year < months / 12 ? (
                  <text x={x + 6 * scale} y={12} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                    year {year + 1}
                  </text>
                ) : null}
              </g>
            )
          })}
          {rows.map(([id, label, start, end], i) => {
            const y = 28 + i * ROW_H
            return (
              <a key={`${route}-${id}`} href={`#${id}`}>
                <text x={LABEL - 10} y={y + 11} textAnchor="end" className="fill-foreground text-[12px]">
                  {label}
                </text>
                <rect x={LABEL + start * scale} y={y + 2} width={(end - start) * scale} height={ROW_H - 8} rx={2}
                  style={{ fill: 'oklch(var(--foreground) / 0.78)' }} />
              </a>
            )
          })}
        </svg>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Rough schedules at about 10 hours a week. Overlapping bars run in the same weeks.
      </figcaption>
    </figure>
  )
}

/** A short block under a subject heading: what it needs, what it opens, how long. */
export function Stage({
  id,
  hours,
  needs,
  unlocks,
  parallel,
}: {
  id: string
  level?: string
  track?: string
  hours?: string
  needs?: string
  unlocks?: string
  parallel?: string
}) {
  const parts = [
    needs && ['Needs', needs],
    parallel && ['Alongside', parallel],
    unlocks && ['Opens', unlocks],
    hours && ['Time', `about ${hours} hours`],
  ].filter(Boolean) as [string, string][]

  return (
    <dl id={id}
      className="not-prose my-5 grid scroll-mt-24 grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1 border-y border-border py-3 text-sm">
      {parts.map(([label, value]) => (
        <React.Fragment key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd>{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

type Status = 'core' | 'later' | 'skip'
const ROMAN: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 }
const ROMAN_LABELS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI']

function parseItem(item: string) {
  const match = /^((?:\d+|[IVX]+)(?:\s*[–,]\s*\d+)*)\s/.exec(item)
  if (!match) return { numbers: [] as number[], onward: false }
  const numbers: number[] = []
  for (const part of match[1].split(',')) {
    const [a, b] = part.trim().split('–').map((n) => (n in ROMAN ? ROMAN[n] : Number(n)))
    for (let n = a; n <= (b ?? a); n++) numbers.push(n)
  }
  return { numbers, onward: /\bonward\b/.test(item) }
}

function Cell({ status, label, small }: { status?: Status; label: string; small?: boolean }) {
  const size = small ? 'h-3 w-3' : 'h-7 min-w-[1.75rem] px-1'
  const base = `inline-flex shrink-0 items-center justify-center rounded-[3px] text-[11px] tabular-nums ${size}`
  if (status === 'core') return <span className={`${base} bg-foreground font-medium text-background`}>{label}</span>
  if (status === 'later')
    return (
      <span className={`${base} border border-foreground/50 text-foreground`}
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, oklch(var(--foreground) / 0.16) 0 2px, transparent 2px 6px)' }}>
        {label}
      </span>
    )
  if (status === 'skip')
    return <span className={`${base} border border-dashed border-foreground/35 text-muted-foreground line-through`}>{label}</span>
  return <span className={`${base} border border-border text-muted-foreground/60`}>{label}</span>
}

/** A book drawn as a strip of chapters: read now, come back later, skip. */
export function Chapters({
  book,
  core,
  later,
  skip,
  total,
  roman,
}: {
  book: string
  core: string
  later?: string
  skip?: string
  total?: string
  roman?: string
}) {
  const groups = (
    [
      ['core', core],
      ['later', later],
      ['skip', skip],
    ] as [Status, string | undefined][]
  )
    .filter(([, value]) => value)
    .map(([status, value]) => ({ status, items: value!.split(' · ') }))

  let first = Infinity
  let last = total ? Number(total) : 0
  for (const { items } of groups) {
    for (const item of items) {
      for (const n of parseItem(item).numbers) {
        first = Math.min(first, n)
        last = Math.max(last, n)
      }
    }
  }
  const statusOf = new Map<number, Status>()
  for (const { status, items } of groups) {
    for (const item of items) {
      const { numbers, onward } = parseItem(item)
      if (!numbers.length) continue
      if (onward) for (let n = numbers[0]; n <= last; n++) statusOf.set(n, status)
      else for (const n of numbers) statusOf.set(n, status)
    }
  }
  const start = Math.min(first, 1)
  const cells = Number.isFinite(first) ? Array.from({ length: last - start + 1 }, (_, i) => i + start) : []
  const legend: Record<Status, string> = { core: 'Read now', later: 'Later', skip: 'Skip' }

  return (
    <figure className="not-prose my-6 text-sm">
      <figcaption className="mb-2 italic text-muted-foreground">{book}</figcaption>
      <div className="flex flex-wrap gap-1" aria-hidden="true">
        {cells.map((n) => (
          <Cell key={n} status={statusOf.get(n)} label={roman ? ROMAN_LABELS[n] : String(n)} />
        ))}
      </div>
      <dl className="mt-3 grid gap-x-3 gap-y-1.5 sm:grid-cols-[6rem_1fr]">
        {groups.map(({ status, items }) => (
          <React.Fragment key={status}>
            <dt className="flex items-center gap-2 text-muted-foreground sm:items-start sm:pt-[0.3rem]">
              <Cell status={status} label="" small />
              <span className="sm:-mt-[0.3rem]">{legend[status]}</span>
            </dt>
            <dd className="leading-relaxed">{items.join(' · ')}</dd>
          </React.Fragment>
        ))}
      </dl>
    </figure>
  )
}

/** The closed-book test that says you can move on. */
export function Ready({ children, to }: { children: React.ReactNode; to?: string }) {
  return (
    <aside className="ready-test my-6 border-l-2 border-foreground/70 pl-5">
      <p className="text-sm font-semibold">
        {to ? `Ready for ${to} when you can, book closed:` : 'Move on when you can, book closed:'}
      </p>
      {children}
    </aside>
  )
}
