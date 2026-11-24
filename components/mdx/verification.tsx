'use client'

import * as React from 'react'

// Figures for the "Verifying neural networks" series. They all use the same toy
// network, so the numbers in the figures match the numbers in the text:
//
//   h = ReLU(W1 x),  o = W2 h,  label A when o1 > o2,  inputs around c = (0.6, 0.4).
//
// Every figure renders a sensible default state on the server, so the static
// export (and the PDF built from it) shows a real picture without JavaScript.

type Vec = [number, number]
type Poly = Vec[]
type Box = { lo: Vec; hi: Vec }

const W1 = [
  [1, 1],
  [1, -1],
]
const W2 = [
  [2, -1],
  [1, 1],
]
const C: Vec = [0.6, 0.4]

const mul = (W: number[][], p: Vec): Vec => [W[0][0] * p[0] + W[0][1] * p[1], W[1][0] * p[0] + W[1][1] * p[1]]
const relu = (p: Vec): Vec => [Math.max(0, p[0]), Math.max(0, p[1])]
const marginAt = (x: Vec) => {
  const o = mul(W2, relu(mul(W1, x)))
  return o[0] - o[1]
}

const square = (c: Vec, r: number): Poly => [
  [c[0] - r, c[1] - r],
  [c[0] + r, c[1] - r],
  [c[0] + r, c[1] + r],
  [c[0] - r, c[1] + r],
]

const rect = (x: [number, number], y: [number, number]): Poly => [
  [x[0], y[0]],
  [x[1], y[0]],
  [x[1], y[1]],
  [x[0], y[1]],
]

const boxPoly = ({ lo, hi }: Box): Poly => rect([lo[0], hi[0]], [lo[1], hi[1]])
const inputBox = (eps: number): Box => ({ lo: [C[0] - eps, C[1] - eps], hi: [C[0] + eps, C[1] + eps] })

/** Keeps the part of a convex polygon where a·p >= b. */
function clip(poly: Poly, a: Vec, b: number): Poly {
  const out: Poly = []
  const side = (p: Vec) => a[0] * p[0] + a[1] * p[1] - b
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length]
    const sp = side(p)
    const sq = side(q)
    if (sp >= 0) out.push(p)
    if (sp >= 0 !== sq >= 0) {
      const t = sp / (sp - sq)
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])])
    }
  })
  return out
}

const area = (poly: Poly) =>
  Math.abs(
    poly.reduce((sum, p, i) => {
      const q = poly[(i + 1) % poly.length]
      return sum + p[0] * q[1] - q[0] * p[1]
    }, 0),
  ) / 2

function boundsOf(points: Vec[]): Box {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  return { lo: [Math.min(...xs), Math.min(...ys)], hi: [Math.max(...xs), Math.max(...ys)] }
}

/** Interval arithmetic through one linear layer: the best box, coordinate by coordinate. */
function intervalLayer(W: number[][], { lo, hi }: Box): Box {
  const l: Vec = [0, 0]
  const h: Vec = [0, 0]
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const w = W[i][j]
      l[i] += w * (w >= 0 ? lo[j] : hi[j])
      h[i] += w * (w >= 0 ? hi[j] : lo[j])
    }
  }
  return { lo: l, hi: h }
}

function boxAnalysis(input: Box) {
  const z = intervalLayer(W1, input)
  const h = { lo: relu(z.lo), hi: relu(z.hi) }
  const o = intervalLayer(W2, h)
  return { z, h, o, proves: o.lo[0] - o.hi[1] > 1e-9 }
}

/**
 * The exact sets for the toy network. Valid for eps <= 0.25: there h1 never
 * switches off, and the part of the z-diamond that the ReLU flattens lands
 * inside the bottom edge of what is kept, so the image of the square is a polygon.
 */
function exactSets(eps: number) {
  const x = square(C, eps)
  const z = x.map((p) => mul(W1, p))
  const h = clip(z, [0, 1], 0)
  const flattened = clip(z, [0, -1], 0)
  const o = h.map((p) => mul(W2, p))
  const minMargin = Math.min(...o.map((p) => p[0] - p[1]))
  return { x, z, h, flattened, o, minMargin, tightest: boundsOf(o) }
}

/**
 * Zonotopes in the DeepZ style. Affine forms are [centre, e1, e2, e3, e4]: e1 and
 * e2 are the two inputs, e3 and e4 are fresh symbols for a ReLU that can switch.
 */
function zonotopeAnalysis(eps: number) {
  const x1 = [C[0], eps, 0, 0, 0]
  const x2 = [C[1], 0, eps, 0, 0]
  const lin = (a: number, u: number[], b: number, v: number[]) => u.map((ui, k) => a * ui + b * v[k])
  const z = [lin(1, x1, 1, x2), lin(1, x1, -1, x2)]
  const h = z.map((f, n) => {
    const radius = f.slice(1).reduce((s, g) => s + Math.abs(g), 0)
    const l = f[0] - radius
    const u = f[0] + radius
    if (l >= 0) return f
    if (u <= 0) return f.map(() => 0)
    const lambda = u / (u - l)
    const mu = (-lambda * l) / 2
    const g = f.map((v) => lambda * v)
    g[0] += mu
    g[3 + n] += mu
    return g
  })
  const o1 = lin(2, h[0], -1, h[1])
  const o2 = lin(1, h[0], 1, h[1])
  const centre: Vec = [o1[0], o2[0]]
  const gens: Vec[] = o1.slice(1).map((g, k) => [g, o2[k + 1]] as Vec)
  const marginLow = o1[0] - o2[0] - gens.reduce((s, g) => s + Math.abs(g[0] - g[1]), 0)
  return { polygon: zonotopePolygon(centre, gens), marginLow, proves: marginLow > 1e-9 }
}

function zonotopePolygon(centre: Vec, gens: Vec[]): Poly {
  const gs = gens
    .filter((g) => Math.hypot(g[0], g[1]) > 1e-12)
    .map((g) => (g[1] < 0 || (g[1] === 0 && g[0] < 0) ? ([-g[0], -g[1]] as Vec) : g))
    .sort((a, b) => Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]))
  let p: Vec = [centre[0] - gs.reduce((s, g) => s + g[0], 0), centre[1] - gs.reduce((s, g) => s + g[1], 0)]
  const out: Poly = [p]
  for (const sign of [2, -2]) {
    for (const g of gs) {
      p = [p[0] + sign * g[0], p[1] + sign * g[1]]
      out.push(p)
    }
  }
  out.pop()
  return out
}

const fmt = (v: number, digits = 2) => (Math.abs(v) < 5e-10 ? 0 : v).toFixed(digits)

// ---------------------------------------------------------------------------
// Drawing helpers

const ink = (alpha = 1) => `oklch(var(--foreground) / ${alpha})`
const accent = (alpha = 1) => `oklch(var(--accent) / ${alpha})`

type Scale = {
  sx: (v: number) => number
  sy: (v: number) => number
  path: (poly: Poly) => string
  hatch: string
  frame: { x: [number, number]; y: [number, number] }
}

const PAD = { l: 36, r: 10, t: 10, b: 34 }

function useUid() {
  return React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
}

function Plot({
  x,
  y,
  size = 240,
  xLabel,
  yLabel,
  xTicks,
  yTicks,
  title,
  label,
  children,
}: {
  x: [number, number]
  y: [number, number]
  size?: number
  xLabel: string
  yLabel: string
  xTicks: number[]
  yTicks: number[]
  title?: string
  label: string
  children: (s: Scale) => React.ReactNode
}) {
  const uid = useUid()
  const top = PAD.t + (title ? 18 : 0)
  const sx = (v: number) => PAD.l + ((v - x[0]) / (x[1] - x[0])) * size
  const sy = (v: number) => top + ((y[1] - v) / (y[1] - y[0])) * size
  const path = (poly: Poly) =>
    poly.length ? `M${poly.map((p) => `${sx(p[0]).toFixed(2)},${sy(p[1]).toFixed(2)}`).join(' L')} Z` : ''
  const scale: Scale = { sx, sy, path, hatch: `url(#${uid}-hatch)`, frame: { x, y } }
  const width = PAD.l + size + PAD.r
  const height = top + size + PAD.b

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={label}>
      <defs>
        <pattern id={`${uid}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" style={{ stroke: ink(0.22), strokeWidth: 1.4 }} />
        </pattern>
        <clipPath id={`${uid}-clip`}>
          <rect x={PAD.l} y={top} width={size} height={size} />
        </clipPath>
      </defs>
      {title ? (
        <text x={PAD.l} y={PAD.t + 6} className="fill-foreground text-[12px] font-medium">
          {title}
        </text>
      ) : null}
      <rect x={PAD.l} y={top} width={size} height={size} style={{ fill: 'none', stroke: ink(0.25) }} />
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line x1={sx(t)} x2={sx(t)} y1={top + size} y2={top + size + 4} style={{ stroke: ink(0.4) }} />
          <text x={sx(t)} y={top + size + 15} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            {t}
          </text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={PAD.l - 4} x2={PAD.l} y1={sy(t)} y2={sy(t)} style={{ stroke: ink(0.4) }} />
          <text x={PAD.l - 7} y={sy(t) + 3} textAnchor="end" className="fill-muted-foreground text-[10px]">
            {t}
          </text>
        </g>
      ))}
      <text x={PAD.l + size / 2} y={top + size + 30} textAnchor="middle" className="fill-foreground text-[12px] italic">
        {xLabel}
      </text>
      <text
        x={10}
        y={top + size / 2}
        textAnchor="middle"
        transform={`rotate(-90 10 ${top + size / 2})`}
        className="fill-foreground text-[12px] italic"
      >
        {yLabel}
      </text>
      <g clipPath={`url(#${uid}-clip)`}>{children(scale)}</g>
    </svg>
  )
}

/** Hatched half-plane a·p >= b inside the plot frame, with its boundary line. */
function Unsafe({ s, a, b }: { s: Scale; a: Vec; b: number }) {
  const region = clip(rect(s.frame.x, s.frame.y), a, b)
  // Boundary: two far-apart points on a·p = b.
  const d: Vec = [-a[1], a[0]]
  const p0: Vec = Math.abs(a[1]) > 1e-9 ? [0, b / a[1]] : [b / a[0], 0]
  const far = 100
  return (
    <g>
      <path d={s.path(region)} style={{ fill: s.hatch }} />
      <line
        x1={s.sx(p0[0] - far * d[0])}
        y1={s.sy(p0[1] - far * d[1])}
        x2={s.sx(p0[0] + far * d[0])}
        y2={s.sy(p0[1] + far * d[1])}
        style={{ stroke: ink(0.55), strokeWidth: 1 }}
      />
    </g>
  )
}

const exactStyle = { fill: accent(0.16), stroke: accent(1), strokeWidth: 1.5 }
const boxStyle = { fill: 'none', stroke: ink(0.9), strokeWidth: 1.3, strokeDasharray: '5 3' }
const tightStyle = { fill: 'none', stroke: ink(0.6), strokeWidth: 1.2, strokeDasharray: '1.5 3' }
const zonoStyle = { fill: 'none', stroke: ink(0.85), strokeWidth: 1.3 }

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  digits = 2,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  digits?: number
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="min-w-[4rem] shrink-0 whitespace-nowrap tabular-nums">
        <span className="italic">{label}</span> = {value.toFixed(digits)}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full max-w-xs"
        style={{ accentColor: 'oklch(var(--accent))' }}
        aria-label={label}
      />
    </label>
  )
}

function Choice<T extends string | number>({
  label,
  options,
  value,
  onChange,
  show = (v: T) => String(v),
}: {
  label: string
  options: T[]
  value: T
  onChange: (v: T) => void
  show?: (v: T) => string
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm" role="group" aria-label={label}>
      <span className="mr-1 text-muted-foreground">{label}</span>
      {options.map((option) => (
        <button
          key={String(option)}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={option === value}
          className={
            option === value
              ? 'rounded border border-foreground bg-foreground px-2 py-0.5 tabular-nums text-background'
              : 'rounded border border-border px-2 py-0.5 tabular-nums hover:border-foreground/60'
          }
        >
          {show(option)}
        </button>
      ))}
    </div>
  )
}

const buttonClass = 'rounded border border-border px-2.5 py-1 text-sm hover:border-foreground/60'

function Legend({ items }: { items: { swatch: React.ReactNode; text: React.ReactNode }[] }) {
  return (
    <ul className="mt-3 space-y-1 text-sm">
      {items.map((item, i) => (
        <li key={i} className="flex items-baseline gap-2.5">
          <svg width="22" height="12" className="shrink-0 translate-y-[1px]" aria-hidden="true">
            {item.swatch}
          </svg>
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  )
}

const swatch = {
  exact: <rect x="1" y="1" width="20" height="10" style={exactStyle} />,
  box: <rect x="1" y="1" width="20" height="10" style={boxStyle} />,
  tight: <rect x="1" y="1" width="20" height="10" style={tightStyle} />,
  zono: <path d="M1,11 L6,1 L21,1 L16,11 Z" style={zonoStyle} />,
  unsafe: (
    <g>
      <rect x="1" y="1" width="20" height="10" style={{ fill: ink(0.06), stroke: ink(0.3) }} />
      {[3, 8, 13, 18].map((x) => (
        <line key={x} x1={x} y1="11" x2={x + 4} y2="1" style={{ stroke: ink(0.3) }} />
      ))}
    </g>
  ),
}

// Frames shared by several figures.
const INPUT_FRAME = { x: [0.3, 0.9] as [number, number], y: [0.1, 0.7] as [number, number] }
const INPUT_TICKS = { x: [0.4, 0.6, 0.8], y: [0.2, 0.4, 0.6] }
const HIDDEN_FRAME = { x: [0.4, 1.6] as [number, number], y: [-0.4, 0.8] as [number, number] }
const OUTPUT_FRAME = { x: [0.4, 3.0] as [number, number], y: [0.2, 2.8] as [number, number] }
const OUTPUT_TICKS = { x: [1, 1.5, 2, 2.5], y: [0.5, 1, 1.5, 2, 2.5] }

// ---------------------------------------------------------------------------
// The network itself

/** The toy network, drawn in full. With values="center" it also shows the values at c. */
export function NetworkDiagram({ values }: { values?: string }) {
  const show = values === 'center'
  const x = { in: 70, hid: 270, out: 470 }
  const y = [70, 190]
  const R = 22
  const nodes = [
    { id: 'x1', cx: x.in, cy: y[0], label: 'x₁', value: '0.6' },
    { id: 'x2', cx: x.in, cy: y[1], label: 'x₂', value: '0.4' },
    { id: 'h1', cx: x.hid, cy: y[0], label: 'h₁', value: '1.0' },
    { id: 'h2', cx: x.hid, cy: y[1], label: 'h₂', value: '0.2' },
    { id: 'o1', cx: x.out, cy: y[0], label: 'o₁', value: '1.8' },
    { id: 'o2', cx: x.out, cy: y[1], label: 'o₂', value: '1.2' },
  ]
  const at = (id: string) => nodes.find((n) => n.id === id)!
  const edges: [string, string, string][] = [
    ['x1', 'h1', '1'],
    ['x2', 'h1', '1'],
    ['x1', 'h2', '1'],
    ['x2', 'h2', '−1'],
    ['h1', 'o1', '2'],
    ['h2', 'o1', '−1'],
    ['h1', 'o2', '1'],
    ['h2', 'o2', '1'],
  ]

  return (
    <figure className="not-prose my-8">
      <svg viewBox="0 0 600 270" className="mx-auto w-full max-w-xl" role="img"
        aria-label="The toy network: two inputs, two hidden ReLU neurons, two outputs, with their weights">
        {edges.map(([from, to, w]) => {
          const a = at(from)
          const b = at(to)
          const len = Math.hypot(b.cx - a.cx, b.cy - a.cy)
          const ux = (b.cx - a.cx) / len
          const uy = (b.cy - a.cy) / len
          const t = 0.26
          const lx = a.cx + (b.cx - a.cx) * t
          const ly = a.cy + (b.cy - a.cy) * t
          return (
            <g key={`${from}-${to}`}>
              <line x1={a.cx + ux * R} y1={a.cy + uy * R} x2={b.cx - ux * (R + 4)} y2={b.cy - uy * (R + 4)}
                style={{ stroke: ink(0.45), strokeWidth: 1.2 }} markerEnd="url(#nn-arrow)" />
              <rect x={lx - 11} y={ly - 9} width={22} height={17} rx={3} style={{ fill: 'oklch(var(--background))' }} />
              <text x={lx} y={ly + 4} textAnchor="middle" className="fill-foreground text-[12px] tabular-nums">
                {w}
              </text>
            </g>
          )
        })}
        <defs>
          <marker id="nn-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" style={{ fill: ink(0.45) }} />
          </marker>
        </defs>
        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.cx} cy={n.cy} r={R}
              style={{ fill: 'oklch(var(--background))', stroke: ink(n.id.startsWith('h') ? 0.9 : 0.6), strokeWidth: 1.3 }} />
            <text x={n.cx} y={n.cy + 5} textAnchor="middle" className="fill-foreground text-[15px] italic">
              {n.label}
            </text>
            {show ? (
              <text x={n.cx} y={n.cy + R + 16} textAnchor="middle" className="text-[12px] tabular-nums"
                style={{ fill: accent(1) }}>
                {n.value}
              </text>
            ) : null}
          </g>
        ))}
        <text x={x.hid} y={y[1] + R + (show ? 34 : 18)} textAnchor="middle" className="fill-muted-foreground text-[11px]">
          ReLU: keep positives, zero the rest
        </text>
        <text x={x.in} y={24} textAnchor="middle" className="fill-muted-foreground text-[11px]">input</text>
        <text x={x.hid} y={24} textAnchor="middle" className="fill-muted-foreground text-[11px]">hidden</text>
        <text x={x.out} y={24} textAnchor="middle" className="fill-muted-foreground text-[11px]">output</text>
        <text x={x.out + 36} y={(y[0] + y[1]) / 2 + 4} className="fill-foreground text-[12px]">
          label A
        </text>
        <text x={x.out + 36} y={(y[0] + y[1]) / 2 + 20} className="fill-muted-foreground text-[11px]">
          if o₁ &gt; o₂
        </text>
      </svg>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        The network used in every chapter. Each arrow multiplies by its weight, each circle adds what arrives.
        {show ? ' In colour, the values at the input c = (0.6, 0.4).' : null}
      </figcaption>
    </figure>
  )
}

// ---------------------------------------------------------------------------
// Chapter 1

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random testing of the robustness property, with the option to reveal where it fails. */
export function SamplingLab() {
  const [eps, setEps] = React.useState(0.16)
  const [units, setUnits] = React.useState<Vec[]>([])
  const [reveal, setReveal] = React.useState(false)
  const rng = React.useRef<(() => number) | null>(null)

  const draw = (n: number) => {
    if (!rng.current) rng.current = mulberry32(Date.now())
    const next = rng.current
    setUnits((prev) => [...prev, ...Array.from({ length: n }, () => [next() * 2 - 1, next() * 2 - 1] as Vec)])
  }

  const points = units.map((u) => [C[0] + eps * u[0], C[1] + eps * u[1]] as Vec)
  const flips = points.filter((p) => marginAt(p) <= 1e-12)
  const sq = square(C, eps)
  const bad = clip(sq, [1, -3], 0)
  const share = area(bad) / area(sq)
  const frame = { x: [0.35, 0.85] as [number, number], y: [0.15, 0.65] as [number, number] }

  return (
    <figure className="not-prose my-10">
      <div className="mx-auto max-w-md">
        <Plot x={frame.x} y={frame.y} size={300} xLabel="x₁" yLabel="x₂" xTicks={[0.4, 0.5, 0.6, 0.7, 0.8]}
          yTicks={[0.2, 0.3, 0.4, 0.5, 0.6]} label="The square of allowed inputs, with the inputs tested so far">
          {(s) => (
            <>
              <path d={s.path(sq)} style={{ fill: accent(0.06), stroke: ink(0.8), strokeWidth: 1.2 }} />
              {points.map((p, i) => {
                const flipped = marginAt(p) <= 1e-12
                return flipped ? null : <circle key={i} cx={s.sx(p[0])} cy={s.sy(p[1])} r={1.5} style={{ fill: ink(0.5) }} />
              })}
              {reveal && bad.length ? (
                <path d={s.path(bad)} style={{ fill: accent(0.75), stroke: accent(1), strokeWidth: 1.5 }} />
              ) : null}
              {flips.map((p, i) => (
                <circle key={`f${i}`} cx={s.sx(p[0])} cy={s.sy(p[1])} r={3.2}
                  style={{ fill: 'none', stroke: accent(1), strokeWidth: 1.6 }} />
              ))}
              <circle cx={s.sx(C[0])} cy={s.sy(C[1])} r={3} style={{ fill: ink(1) }} />
              <text x={s.sx(C[0]) + 6} y={s.sy(C[1]) - 6} className="fill-foreground text-[11px] italic">c</text>
            </>
          )}
        </Plot>
        <div className="mt-3 space-y-3">
          <Slider label="ε" value={eps} min={0.05} max={0.2} step={0.01} onChange={setEps} />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={buttonClass} onClick={() => draw(100)}>Try 100 inputs</button>
            <button type="button" className={buttonClass} onClick={() => draw(1000)}>Try 1,000</button>
            <button type="button" className={buttonClass} onClick={() => setUnits([])}>Start over</button>
            <label className="ml-1 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={reveal} onChange={(e) => setReveal(e.target.checked)}
                style={{ accentColor: 'oklch(var(--accent))' }} />
              Show where it flips
            </label>
          </div>
          <p className="text-sm tabular-nums" aria-live="polite">
            {units.length === 0
              ? 'No inputs tried yet.'
              : `${units.length.toLocaleString('en-US')} inputs tried, ${flips.length} flipped the label.`}
            {reveal
              ? share > 0
                ? ` The label flips on ${(100 * share).toFixed(2)}% of the square.`
                : ' At this ε nothing in the square flips the label.'
              : null}
          </p>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Every input in the square is allowed. Grey dots are tests that kept label A, circled ones flipped it.
      </figcaption>
    </figure>
  )
}

/** The set of outputs, with optional box and zonotope approximations. */
export function ThreeShapes({ shapes = 'all', initial }: { shapes?: string; initial?: string }) {
  const [eps, setEps] = React.useState(initial ? Number(initial) : 0.12)
  const all = shapes !== 'exact'
  const ex = exactSets(eps)
  const bx = boxAnalysis(inputBox(eps))
  const zn = zonotopeAnalysis(eps)
  const robust = ex.minMargin > 1e-9

  return (
    <figure className="not-prose my-10">
      <div className="mx-auto max-w-md">
        <Plot x={OUTPUT_FRAME.x} y={OUTPUT_FRAME.y} size={300} xLabel="o₁" yLabel="o₂" xTicks={OUTPUT_TICKS.x}
          yTicks={OUTPUT_TICKS.y} label="Outputs of the network on the square of inputs">
          {(s) => (
            <>
              <Unsafe s={s} a={[-1, 1]} b={0} />
              <path d={s.path(ex.o)} style={exactStyle} />
              {all ? <path d={s.path(zn.polygon)} style={zonoStyle} /> : null}
              {all ? <path d={s.path(boxPoly(bx.o))} style={boxStyle} /> : null}
            </>
          )}
        </Plot>
        <div className="mt-3">
          <Slider label="ε" value={eps} min={0.02} max={0.2} step={0.01} onChange={setEps} />
        </div>
        <Legend
          items={[
            {
              swatch: swatch.exact,
              text: robust
                ? `What the network can output. Always label A: o₁ − o₂ is at least ${fmt(ex.minMargin)}.`
                : `What the network can output. Some inputs flip the label: o₁ − o₂ goes down to ${fmt(ex.minMargin)}.`,
            },
            ...(all
              ? [
                  {
                    swatch: swatch.zono,
                    text: zn.proves
                      ? `Zonotope (chapter 4): stays out of the hatched region, so it proves the label.`
                      : `Zonotope (chapter 4): touches the hatched region, so it can't conclude.`,
                  },
                  {
                    swatch: swatch.box,
                    text: bx.proves
                      ? `Box (chapter 2): stays out of the hatched region, so it proves the label.`
                      : `Box (chapter 2): touches the hatched region, so it can't conclude.`,
                  },
                ]
              : []),
            { swatch: swatch.unsafe, text: 'Where o₂ ≥ o₁, so the label is no longer A.' },
          ]}
        />
      </div>
    </figure>
  )
}

/** Schematic: the three possible outcomes of an over-approximation. */
export function ThreeCases() {
  const blob = 'M-34,-6 C-36,-26 -10,-34 8,-28 C30,-22 38,-6 30,10 C22,26 0,32 -16,26 C-30,20 -32,8 -34,-6 Z'
  const cases = [
    { title: 'Proved', note: 'the outer shape is safe, so the network is', fx: 0, fy: 26, ox: 0, oy: 24, rx: 56, ry: 44 },
    { title: 'Inconclusive', note: 'the network is safe, the outer shape is not', fx: -4, fy: 14, ox: 0, oy: 0, rx: 64, ry: 56 },
    { title: 'Real counterexample', note: 'some actual outputs are unsafe', fx: 26, fy: -20, ox: 22, oy: -12, rx: 58, ry: 46 },
  ]
  const uid = useUid()

  return (
    <figure className="not-prose my-10">
      <div className="grid gap-4 sm:grid-cols-3">
        {cases.map((k) => (
          <svg key={k.title} viewBox="-90 -86 180 196" className="w-full" role="img" aria-label={`${k.title}: ${k.note}`}>
            <defs>
              <pattern id={`${uid}-h`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" style={{ stroke: ink(0.22), strokeWidth: 1.4 }} />
              </pattern>
            </defs>
            <rect x="-90" y="-86" width="180" height="170" style={{ fill: 'none', stroke: ink(0.2) }} />
            <path d="M-90,-86 L90,-86 L90,-20 L-90,-70 Z" style={{ fill: `url(#${uid}-h)` }} />
            <line x1="-90" y1="-70" x2="90" y2="-20" style={{ stroke: ink(0.55) }} />
            <ellipse cx={k.ox} cy={k.oy} rx={k.rx} ry={k.ry} style={boxStyle} />
            <path d={blob} transform={`translate(${k.fx},${k.fy})`} style={exactStyle} />
            <text x="0" y="100" textAnchor="middle" className="fill-foreground text-[13px] font-medium">{k.title}</text>
          </svg>
        ))}
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Filled: the true set of outputs. Dashed: the bigger, simpler set we actually compute. Hatched: unsafe outputs.
        Only the left case is a proof. In the middle one the method gives up although the network is fine.
      </figcaption>
    </figure>
  )
}

// ---------------------------------------------------------------------------
// Chapter 2

/** Interval propagation through the toy network, side by side with the exact sets. */
export function BoxPropagation({ initial }: { initial?: string }) {
  const [eps, setEps] = React.useState(initial ? Number(initial) : 0.1)
  const ex = exactSets(eps)
  const bx = boxAnalysis(inputBox(eps))

  return (
    <figure className="not-prose my-10">
      <div className="grid gap-2 sm:grid-cols-3">
        <Plot x={INPUT_FRAME.x} y={INPUT_FRAME.y} title="1. Inputs" xLabel="x₁" yLabel="x₂" xTicks={INPUT_TICKS.x}
          yTicks={INPUT_TICKS.y} label="Input square">
          {(s) => (
            <>
              <Unsafe s={s} a={[1, -3]} b={0} />
              <path d={s.path(ex.x)} style={exactStyle} />
              <path d={s.path(ex.x)} style={boxStyle} />
            </>
          )}
        </Plot>
        <Plot x={HIDDEN_FRAME.x} y={HIDDEN_FRAME.y} title="2. After the ReLU layer" xLabel="h₁" yLabel="h₂"
          xTicks={[0.5, 1, 1.5]} yTicks={[-0.3, 0, 0.3, 0.6]} label="Hidden layer after ReLU">
          {(s) => (
            <>
              <Unsafe s={s} a={[-1, 2]} b={0} />
              <line x1={s.sx(0)} x2={s.sx(2)} y1={s.sy(0)} y2={s.sy(0)} style={{ stroke: ink(0.3) }} />
              {ex.flattened.length ? (
                <path d={s.path(ex.flattened)} style={{ fill: 'none', stroke: accent(0.7), strokeDasharray: '2 2' }} />
              ) : null}
              <path d={s.path(ex.h)} style={exactStyle} />
              <path d={s.path(boxPoly(bx.h))} style={boxStyle} />
            </>
          )}
        </Plot>
        <Plot x={OUTPUT_FRAME.x} y={OUTPUT_FRAME.y} title="3. Outputs" xLabel="o₁" yLabel="o₂" xTicks={OUTPUT_TICKS.x}
          yTicks={OUTPUT_TICKS.y} label="Outputs">
          {(s) => (
            <>
              <Unsafe s={s} a={[-1, 1]} b={0} />
              <path d={s.path(ex.o)} style={exactStyle} />
              <path d={s.path(boxPoly(ex.tightest))} style={tightStyle} />
              <path d={s.path(boxPoly(bx.o))} style={boxStyle} />
            </>
          )}
        </Plot>
      </div>
      <div className="mx-auto mt-3 max-w-xl">
        <Slider label="ε" value={eps} min={0.02} max={0.2} step={0.01} onChange={setEps} />
        <Legend
          items={[
            {
              swatch: swatch.box,
              text: (
                <>
                  Boxes, layer by layer: o₁ ∈ [{fmt(bx.o.lo[0])}, {fmt(bx.o.hi[0])}], o₂ ∈ [{fmt(bx.o.lo[1])},{' '}
                  {fmt(bx.o.hi[1])}].{' '}
                  {bx.proves ? 'No overlap: proved.' : 'The ranges overlap: no conclusion.'}
                </>
              ),
            },
            {
              swatch: swatch.tight,
              text: (
                <>
                  The tightest box around the true outputs: o₁ ≥ {fmt(ex.tightest.lo[0])}, o₂ ≤ {fmt(ex.tightest.hi[1])}.{' '}
                  {ex.tightest.lo[0] - ex.tightest.hi[1] > 1e-9 ? 'Would prove it.' : 'Would still not prove it.'}
                </>
              ),
            },
            {
              swatch: swatch.exact,
              text: (
                <>
                  The true sets. Smallest o₁ − o₂: {fmt(ex.minMargin)},{' '}
                  {ex.minMargin > 1e-9 ? 'so the label never changes.' : 'so some inputs do not get label A.'}
                </>
              ),
            },
          ]}
        />
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        The same input square pushed through the network twice: exactly (filled) and with interval arithmetic
        (dashed). Hatched regions are the inputs, hidden values and outputs that end in a flipped label. In the middle
        panel, the dotted outline is the part of the set that the ReLU flattens onto h₂ = 0.
      </figcaption>
    </figure>
  )
}

/** The wrapping effect: a box around a rotated box around a rotated box... */
export function WrappingEffect() {
  const [step, setStep] = React.useState(1)
  const [playing, setPlaying] = React.useState(false)

  React.useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setStep((n) => {
        if (n >= 4) {
          setPlaying(false)
          return n
        }
        return n + 1
      })
    }, 900)
    return () => window.clearInterval(id)
  }, [playing])

  const rotate = (poly: Poly, angle: number): Poly =>
    poly.map(([x, y]) => [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)])
  const truth = rotate(square([0, 0], 1), (step * Math.PI) / 4)
  const half = Math.SQRT2 ** step
  const previous = step > 0 ? rotate(square([0, 0], Math.SQRT2 ** (step - 1)), Math.PI / 4) : null
  const ratio = Math.SQRT2 ** step

  return (
    <figure className="not-prose my-10">
      <div className="mx-auto max-w-sm">
        <Plot x={[-4.6, 4.6]} y={[-4.6, 4.6]} size={280} xLabel="first coordinate" yLabel="second coordinate"
          xTicks={[-4, -2, 0, 2, 4]} yTicks={[-4, -2, 0, 2, 4]} label="A square rotated several times, and the boxes around it">
          {(s) => (
            <>
              {previous ? (
                <path d={s.path(previous)} style={{ fill: 'none', stroke: ink(0.45), strokeDasharray: '1.5 3' }} />
              ) : null}
              <path d={s.path(truth)} style={exactStyle} />
              <path d={s.path(square([0, 0], half))} style={boxStyle} />
            </>
          )}
        </Plot>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <Slider label="layers" value={step} min={0} max={4} step={1} digits={0}
              onChange={(v) => { setPlaying(false); setStep(v) }} />
          </div>
          <button type="button" className={buttonClass}
            onClick={() => { if (step >= 4) setStep(0); setPlaying(true) }}>
            Play
          </button>
        </div>
        <p className="mt-2 text-sm tabular-nums">
          {step === 0
            ? 'Before any layer, the box is the square itself.'
            : `After ${step} rotation${step > 1 ? 's' : ''} the box is ${fmt(ratio)} times wider than the square it is supposed to describe, and ${fmt(ratio * ratio, 0)} times larger in area.`}
        </p>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Each layer turns its input by 45°. Filled: where the points really are. Dashed: the box we keep. Dotted: the
        previous box after rotation, which is what the next box has to wrap.
      </figcaption>
    </figure>
  )
}

/** Splitting the input square into smaller boxes and analysing each one. */
export function SplitBoxes() {
  const [eps, setEps] = React.useState(0.12)
  const [k, setK] = React.useState(4)
  const cells: { poly: Poly; proved: boolean }[] = []
  const d = (2 * eps) / k
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const lo: Vec = [C[0] - eps + i * d, C[1] - eps + j * d]
      const hi: Vec = [lo[0] + d, lo[1] + d]
      cells.push({ poly: rect([lo[0], hi[0]], [lo[1], hi[1]]), proved: boxAnalysis({ lo, hi }).proves })
    }
  }
  const proved = cells.filter((c) => c.proved).length
  const frame = { x: [0.44, 0.76] as [number, number], y: [0.24, 0.56] as [number, number] }

  return (
    <figure className="not-prose my-10">
      <div className="mx-auto max-w-sm">
        <Plot x={frame.x} y={frame.y} size={280} xLabel="x₁" yLabel="x₂" xTicks={[0.5, 0.6, 0.7]} yTicks={[0.3, 0.4, 0.5]}
          label="The input square cut into smaller boxes, each analysed separately">
          {(s) => (
            <>
              <Unsafe s={s} a={[1, -3]} b={0} />
              {cells.map((cell, i) => (
                <path key={i} d={s.path(cell.poly)}
                  style={{
                    fill: cell.proved ? accent(0.16) : ink(0.14),
                    stroke: cell.proved ? accent(0.6) : ink(0.7),
                    strokeWidth: cell.proved ? 0.6 : 1,
                  }} />
              ))}
            </>
          )}
        </Plot>
        <div className="mt-3 space-y-2">
          <Choice label="ε" options={[0.1, 0.12, 0.14]} value={eps} onChange={setEps} show={(v) => v.toFixed(2)} />
          <Choice label="pieces per side" options={[1, 2, 4, 8, 16, 32]} value={k} onChange={setK} />
        </div>
        <p className="mt-2 text-sm tabular-nums">
          {k * k === 1 ? 'One box' : `${k} × ${k} = ${(k * k).toLocaleString('en-US')} boxes`}: {proved} proved,{' '}
          {k * k - proved} inconclusive.
          {proved === k * k ? ' Every piece is proved, so the whole square is.' : ''}
        </p>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Each piece goes through interval arithmetic on its own. Blue pieces are proved, grey ones are not. The small
        hatched corner at the bottom right is where the label really flips; at ε = 0.15 the square would touch it.
      </figcaption>
    </figure>
  )
}
