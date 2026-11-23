import * as React from 'react'

// Components for long reading guides (used by the self-study mathematics post).
// They only take string props so the MDX stays plain text.

type Track = 'foundations' | 'analysis' | 'algebra' | 'geometry' | 'applied' | 'probability' | 'logic'

const tracks: Record<Track, { label: string; color: string }> = {
  foundations: { label: 'Foundations', color: '60% 0.03 260' },
  analysis: { label: 'Analysis', color: '58% 0.15 250' },
  algebra: { label: 'Algebra', color: '56% 0.18 305' },
  geometry: { label: 'Geometry and topology', color: '60% 0.13 160' },
  applied: { label: 'Differential equations', color: '66% 0.15 60' },
  probability: { label: 'Probability and statistics', color: '60% 0.17 20' },
  logic: { label: 'Logic and computation', color: '58% 0.08 210' },
}

const color = (track: Track, alpha = 1) => `oklch(${tracks[track].color} / ${alpha})`

type MapEntry = { id: string; name: string; track: Track; optional?: boolean }

const levels: { name: string; note: string; subjects: MapEntry[] }[] = [
  {
    name: 'Level 0',
    note: 'Before you start',
    subjects: [{ id: 'precalculus', name: 'Prerequisites check', track: 'foundations' }],
  },
  {
    name: 'Level 1',
    note: 'First year',
    subjects: [
      { id: 'calculus-1', name: 'Calculus in one variable', track: 'analysis' },
      { id: 'proofs', name: 'Proofs', track: 'foundations' },
      { id: 'linear-algebra-1', name: 'Linear algebra I', track: 'algebra' },
      { id: 'discrete', name: 'Discrete mathematics', track: 'logic', optional: true },
    ],
  },
  {
    name: 'Level 2',
    note: 'Second year',
    subjects: [
      { id: 'calculus-2', name: 'Series and several variables', track: 'analysis' },
      { id: 'analysis-1', name: 'Real analysis', track: 'analysis' },
      { id: 'linear-algebra-2', name: 'Linear algebra II', track: 'algebra' },
      { id: 'algebra-1', name: 'Abstract algebra I', track: 'algebra' },
      { id: 'odes', name: 'Differential equations', track: 'applied' },
      { id: 'probability', name: 'Probability', track: 'probability' },
    ],
  },
  {
    name: 'Level 3',
    note: 'Third year',
    subjects: [
      { id: 'analysis-2', name: 'Function spaces and several variables', track: 'analysis' },
      { id: 'complex', name: 'Complex analysis', track: 'analysis' },
      { id: 'algebra-2', name: 'Abstract algebra II', track: 'algebra' },
      { id: 'topology', name: 'Topology', track: 'geometry' },
      { id: 'dynamics', name: 'Dynamical systems', track: 'applied', optional: true },
      { id: 'number-theory', name: 'Number theory', track: 'algebra', optional: true },
    ],
  },
  {
    name: 'Level 4',
    note: 'The doorway to graduate work',
    subjects: [
      { id: 'measure', name: 'Measure and integration', track: 'analysis' },
      { id: 'functional', name: 'Functional analysis', track: 'analysis' },
      { id: 'pdes', name: 'Partial differential equations', track: 'applied' },
      { id: 'differential-geometry', name: 'Differential geometry', track: 'geometry' },
      { id: 'algebraic-topology', name: 'Algebraic topology', track: 'geometry', optional: true },
      { id: 'probability-2', name: 'Measure-theoretic probability', track: 'probability', optional: true },
      { id: 'numerical', name: 'Numerical analysis', track: 'logic', optional: true },
      { id: 'logic', name: 'Mathematical logic', track: 'logic', optional: true },
    ],
  },
]

/** The whole curriculum on one screen, grouped by level and colored by track. */
export function Roadmap() {
  return (
    <figure className="not-prose my-10 rounded-lg border border-border p-4 sm:p-6">
      <ol className="space-y-5">
        {levels.map((level) => (
          <li key={level.name} className="grid gap-2 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
            <div className="text-sm">
              <p className="font-semibold">{level.name}</p>
              <p className="text-muted-foreground">{level.note}</p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {level.subjects.map((subject) => (
                <li key={subject.id}>
                  <a
                    href={`#${subject.id}`}
                    className="inline-flex items-center rounded-md border px-2.5 py-1 text-sm transition-colors hover:bg-muted"
                    style={{
                      borderColor: color(subject.track, 0.55),
                      borderStyle: subject.optional ? 'dashed' : 'solid',
                      boxShadow: `inset 3px 0 0 ${color(subject.track)}`,
                    }}
                  >
                    {subject.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <figcaption className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
        {(Object.keys(tracks) as Track[]).map((track) => (
          <span key={track} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color(track) }} />
            {tracks[track].label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm border border-dashed border-muted-foreground" />
          Optional, depending on your goals
        </span>
      </figcaption>
    </figure>
  )
}

/** Header card for one subject: level, time, what it needs and what it opens. */
export function Stage({
  id,
  level,
  track,
  hours,
  needs,
  unlocks,
  parallel,
}: {
  id: string
  level: string
  track: Track
  hours?: string
  needs?: string
  unlocks?: string
  parallel?: string
}) {
  const rows = [
    ['Needs', needs],
    ['Run it alongside', parallel],
    ['Opens', unlocks],
  ].filter(([, value]) => value) as [string, string][]

  return (
    <div id={id} className="not-prose my-6 scroll-mt-24 rounded-lg border border-border text-sm"
      style={{ boxShadow: `inset 4px 0 0 ${color(track)}` }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-4 py-2.5 pl-5">
        <span className="font-medium" style={{ color: color(track) }}>
          {level} · {tracks[track].label}
        </span>
        {hours ? <span className="tabular-nums text-muted-foreground">about {hours} hours</span> : null}
      </div>
      <dl className="grid gap-x-4 gap-y-1.5 px-4 py-3 pl-5 sm:grid-cols-[8.5rem_1fr]">
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  )
}

/** Which chapters of a book to read now, later, or not at all. */
export function Chapters({
  book,
  core,
  later,
  skip,
}: {
  book: string
  core: string
  later?: string
  skip?: string
}) {
  const columns = [
    { label: 'Read now', value: core, tone: 'oklch(var(--accent))' },
    { label: 'Come back later', value: later, tone: 'oklch(var(--muted-foreground))' },
    { label: 'Skip', value: skip, tone: 'oklch(var(--muted-foreground) / 0.65)' },
  ].filter((column) => column.value)

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-border text-sm">
      <p className="border-b border-border bg-muted px-4 py-2 font-medium">{book}</p>
      <div className="grid divide-y divide-border sm:grid-flow-col sm:auto-cols-fr sm:divide-x sm:divide-y-0">
        {columns.map((column) => (
          <div key={column.label} className="px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: column.tone }}>
              {column.label}
            </p>
            <ul className="space-y-1 leading-snug">
              {column.value!.split(' · ').map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

/** The test that says you can move on. */
export function Ready({ children, to }: { children: React.ReactNode; to?: string }) {
  return (
    <aside className="my-6 rounded-lg border border-accent/40 bg-accent/5 px-5 py-4 text-[0.95rem] [&>ul]:my-2 [&>p]:mt-0">
      <p className="mb-1 text-sm font-semibold text-accent">
        {to ? `Ready for ${to} when you can, with the book closed:` : 'Ready to move on when you can, with the book closed:'}
      </p>
      {children}
    </aside>
  )
}
