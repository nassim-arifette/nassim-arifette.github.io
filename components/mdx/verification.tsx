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
  /** Inverse of sx and sy, from SVG user units back to data coordinates. */
  ix: (px: number) => number
  iy: (py: number) => number
  path: (poly: Poly) => string
  hatch: string
  frame: { x: [number, number]; y: [number, number] }
}

const PAD = { l: 42, r: 10, t: 10, b: 34 }

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
  const ix = (px: number) => x[0] + ((px - PAD.l) / size) * (x[1] - x[0])
  const iy = (py: number) => y[1] - ((py - top) / size) * (y[1] - y[0])
  const path = (poly: Poly) =>
    poly.length ? `M${poly.map((p) => `${sx(p[0]).toFixed(2)},${sy(p[1]).toFixed(2)}`).join(' L')} Z` : ''
  const scale: Scale = { sx, sy, ix, iy, path, hatch: `url(#${uid}-hatch)`, frame: { x, y } }
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
        x={9}
        y={top + size / 2}
        textAnchor="middle"
        transform={`rotate(-90 9 ${top + size / 2})`}
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

// ---------------------------------------------------------------------------
// Chapter 3

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const inBox = (p: Vec, b: Box) =>
  p[0] >= b.lo[0] - 1e-9 && p[0] <= b.hi[0] + 1e-9 && p[1] >= b.lo[1] - 1e-9 && p[1] <= b.hi[1] + 1e-9

type Grip = 'move' | 'll' | 'lr' | 'ul' | 'ur'
type Corner = Exclude<Grip, 'move'>

const CORNER_NAMES: Record<Corner, string> = {
  ll: 'Bottom left corner',
  lr: 'Bottom right corner',
  ul: 'Top left corner',
  ur: 'Top right corner',
}

/** Moves a box by one of its grips, keeping it inside `limits` and at least `min` wide. */
function dragBox(b: Box, grip: Grip, dx: number, dy: number, limits: Box, min = 0.04): Box {
  let [x0, y0] = b.lo
  let [x1, y1] = b.hi
  if (grip === 'move') {
    const w = x1 - x0
    const h = y1 - y0
    x0 = clamp(x0 + dx, limits.lo[0], limits.hi[0] - w)
    y0 = clamp(y0 + dy, limits.lo[1], limits.hi[1] - h)
    return { lo: [x0, y0], hi: [x0 + w, y0 + h] }
  }
  if (grip === 'll' || grip === 'ul') x0 = clamp(x0 + dx, limits.lo[0], x1 - min)
  if (grip === 'lr' || grip === 'ur') x1 = clamp(x1 + dx, x0 + min, limits.hi[0])
  if (grip === 'll' || grip === 'lr') y0 = clamp(y0 + dy, limits.lo[1], y1 - min)
  if (grip === 'ul' || grip === 'ur') y1 = clamp(y1 + dy, y0 + min, limits.hi[1])
  return { lo: [x0, y0], hi: [x1, y1] }
}

function Verdict({ ok }: { ok: boolean }) {
  return <span className={ok ? 'font-medium text-accent' : 'text-muted-foreground'}>{ok ? 'yes' : 'no'}</span>
}

/** The Galois connection as a game: a box contains the set exactly when it contains the set's best box. */
export function BestBox() {
  const frame = { x: [0.5, 1.5] as [number, number], y: [-0.3, 0.7] as [number, number] }
  const limits: Box = { lo: [0.52, -0.28], hi: [1.48, 0.68] }
  const start: Box = { lo: [0.66, -0.1], hi: [1.36, 0.52] }
  const set = square(C, 0.1).map((p) => mul(W1, p))
  const best = boundsOf(set)
  const [box, setBox] = React.useState<Box>(start)
  const drag = React.useRef<{ grip: Grip; from: Vec; box: Box } | null>(null)
  const containsSet = set.every((p) => inBox(p, box))
  const containsBest = inBox(best.lo, box) && inBox(best.hi, box)

  return (
    <figure className="not-prose my-10">
      <div className="mx-auto max-w-sm">
        <Plot x={frame.x} y={frame.y} size={280} xLabel="h₁" yLabel="h₂" xTicks={[0.6, 0.8, 1, 1.2, 1.4]}
          yTicks={[-0.2, 0, 0.2, 0.4, 0.6]} label="The hidden values at epsilon 0.1, their best box, and a box you can move">
          {(s) => {
            const toData = (e: React.PointerEvent<SVGElement>): Vec | null => {
              const matrix = e.currentTarget.ownerSVGElement?.getScreenCTM()
              if (!matrix) return null
              const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse())
              return [s.ix(p.x), s.iy(p.y)]
            }
            const grip = (g: Grip) => ({
              tabIndex: 0,
              role: 'button' as const,
              onPointerDown: (e: React.PointerEvent<SVGElement>) => {
                const from = toData(e)
                if (!from) return
                e.preventDefault()
                e.currentTarget.setPointerCapture(e.pointerId)
                drag.current = { grip: g, from, box }
              },
              onPointerMove: (e: React.PointerEvent<SVGElement>) => {
                const d = drag.current
                const p = d && d.grip === g ? toData(e) : null
                if (!d || !p) return
                setBox(dragBox(d.box, g, p[0] - d.from[0], p[1] - d.from[1], limits))
              },
              onPointerUp: () => {
                drag.current = null
              },
              onPointerCancel: () => {
                drag.current = null
              },
              onKeyDown: (e: React.KeyboardEvent<SVGElement>) => {
                const step = e.shiftKey ? 0.05 : 0.01
                const moves: Record<string, Vec> = {
                  ArrowLeft: [-step, 0],
                  ArrowRight: [step, 0],
                  ArrowUp: [0, step],
                  ArrowDown: [0, -step],
                }
                const m = moves[e.key]
                if (!m) return
                e.preventDefault()
                setBox((b) => dragBox(b, g, m[0], m[1], limits))
              },
              style: {
                touchAction: 'none' as const,
                cursor: g === 'move' ? 'move' : g === 'll' || g === 'ur' ? 'nesw-resize' : 'nwse-resize',
              },
            })
            const body = grip('move')
            return (
              <>
                <path d={s.path(set)} style={exactStyle} />
                <path d={s.path(boxPoly(best))} style={tightStyle} />
                <path d={s.path(boxPoly(box))} {...body} style={{ ...boxStyle, fill: ink(0.05), ...body.style }}
                  aria-label="Your box. Drag it, or use the arrow keys, to move it." />
                {(Object.keys(CORNER_NAMES) as Corner[]).map((g) => {
                  const px = s.sx(g === 'll' || g === 'ul' ? box.lo[0] : box.hi[0])
                  const py = s.sy(g === 'll' || g === 'lr' ? box.lo[1] : box.hi[1])
                  return (
                    <g key={g} {...grip(g)} aria-label={`${CORNER_NAMES[g]} of your box. Drag it, or use the arrow keys.`}>
                      <circle cx={px} cy={py} r={14} style={{ fill: 'transparent' }} />
                      <rect x={px - 4} y={py - 4} width={8} height={8}
                        style={{ fill: 'oklch(var(--background))', stroke: ink(0.9), strokeWidth: 1.3 }} />
                    </g>
                  )
                })}
              </>
            )
          }}
        </Plot>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm" aria-live="polite">
          <span>Your box contains every hidden value</span>
          <Verdict ok={containsSet} />
          <span>Your box contains the best box</span>
          <Verdict ok={containsBest} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={buttonClass} onClick={() => setBox(best)}>
            Shrink to the best box
          </button>
          <button type="button" className={buttonClass} onClick={() => setBox(start)}>
            Start over
          </button>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Filled: the hidden values at ε = 0.1, the diamond from chapter 2. Dotted: their best box. Dashed: a box of your
        own. Drag it to move it, drag its corners to resize it, or use the arrow keys after Tab. Wherever you put it,
        the two answers agree.
      </figcaption>
    </figure>
  )
}

/** A linear layer turns a box into a slanted shape; ReLU turns a box into a box. */
export function LayerShapes() {
  const [t, setT] = React.useState(1)
  const [run, setRun] = React.useState(0)

  React.useEffect(() => {
    if (!run) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setT(1)
      setRun(0)
      return
    }
    let id = 0
    const start = performance.now()
    const tick = (now: number) => {
      const v = Math.min(1, (now - start) / 1800)
      setT(v)
      if (v < 1) id = requestAnimationFrame(tick)
      else setRun(0)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [run])

  const blend = (p: Vec, q: Vec): Vec => [(1 - t) * p[0] + t * q[0], (1 - t) * p[1] + t * q[1]]
  const linear = (p: Vec) => blend(p, mul(W2, p))
  const ramp = (p: Vec) => blend(p, relu(p))

  // The box around the hidden values at eps = 0.1, and a box that straddles zero.
  const hidden: Box = { lo: [0.8, 0], hi: [1.2, 0.4] }
  const straddling: Box = { lo: [0.6, -0.4], hi: [1.4, 0.4] }
  const linShape = boxPoly(hidden).map(linear)
  const linHull = boundsOf(linShape)
  const ratio = area(boxPoly(linHull)) / area(linShape)
  const reluShape = boxPoly(straddling).map(ramp)

  // Grid lines inside a box. Both maps send these segments to segments, so mapping the ends is enough.
  const grid = (b: Box, xs: number[], ys: number[]): [Vec, Vec][] => [
    ...xs.map((x) => [[x, b.lo[1]], [x, b.hi[1]]] as [Vec, Vec]),
    ...ys.map((y) => [[b.lo[0], y], [b.hi[0], y]] as [Vec, Vec]),
  ]
  const lines = (s: Scale, segments: [Vec, Vec][], f: (p: Vec) => Vec) =>
    segments.map(([p, q], i) => {
      const a = f(p)
      const b = f(q)
      return (
        <line key={i} x1={s.sx(a[0])} y1={s.sy(a[1])} x2={s.sx(b[0])} y2={s.sy(b[1])}
          style={{ stroke: accent(0.45), strokeWidth: 0.7 }} />
      )
    })
  const startStyle = { fill: 'none', stroke: ink(0.3), strokeWidth: 1 }

  return (
    <figure className="not-prose my-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Plot x={[0.6, 2.6]} y={[-0.2, 1.8]} title="A linear layer: W₂" xLabel="first coordinate"
            yLabel="second coordinate" xTicks={[1, 1.5, 2, 2.5]} yTicks={[0, 0.5, 1, 1.5]}
            label="A box going through the linear map W2 becomes a parallelogram">
            {(s) => (
              <>
                <path d={s.path(boxPoly(hidden))} style={startStyle} />
                <path d={s.path(linShape)} style={exactStyle} />
                {lines(s, grid(hidden, [0.9, 1, 1.1], [0.1, 0.2, 0.3]), linear)}
                <path d={s.path(boxPoly(linHull))} style={boxStyle} />
              </>
            )}
          </Plot>
          <p className="mt-1 text-sm tabular-nums">The dashed box has {fmt(ratio)} times the area of the shape inside it.</p>
        </div>
        <div>
          <Plot x={[0.4, 1.6]} y={[-0.6, 0.6]} title="A ReLU layer" xLabel="first coordinate" yLabel="second coordinate"
            xTicks={[0.5, 1, 1.5]} yTicks={[-0.4, 0, 0.4]} label="A box going through ReLU stays a box">
            {(s) => (
              <>
                <line x1={s.sx(0)} x2={s.sx(2)} y1={s.sy(0)} y2={s.sy(0)} style={{ stroke: ink(0.3) }} />
                <path d={s.path(boxPoly(straddling))} style={startStyle} />
                <path d={s.path(reluShape)} style={exactStyle} />
                {lines(s, grid(straddling, [0.8, 1, 1.2], [-0.3, -0.2, -0.1, 0.1, 0.2, 0.3]), ramp)}
                <path d={s.path(boxPoly(boundsOf(reluShape)))} style={boxStyle} />
              </>
            )}
          </Plot>
          <p className="mt-1 text-sm">The shape is still a box, so the dashed box is the shape itself.</p>
        </div>
      </div>
      <div className="mx-auto mt-4 flex max-w-xl items-center gap-3">
        <div className="flex-1">
          <Slider label="t" value={t} min={0} max={1} step={0.01}
            onChange={(v) => {
              setRun(0)
              setT(v)
            }} />
        </div>
        <button type="button" className={buttonClass} onClick={() => setRun((r) => r + 1)}>
          Play
        </button>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Each layer is applied gradually, from t = 0 (before) to t = 1 (after). Thin outline: the starting box. Filled:
        where its points go. Dashed: the best box around them. On the left, the box around the hidden values at
        ε = 0.1 goes through the second layer of our network. On the right, a box whose second coordinate can be
        negative goes through ReLU.
      </figcaption>
    </figure>
  )
}

/** Cuts the corner of the polygon that lies between tangent angles i and i + 1. */
function cutCorner(angles: number[], i: number): number[] {
  const a = angles[i]
  const b = i + 1 < angles.length ? angles[i + 1] : angles[0] + 2 * Math.PI
  return [...angles, ((a + b) / 2) % (2 * Math.PI)].sort((p, q) => p - q)
}

/** No polygon around a disk is the smallest one: any corner can be cut by one more tangent line. */
export function CutCorners() {
  const square4 = [0, 0.5, 1, 1.5].map((k) => k * Math.PI)
  const [angles, setAngles] = React.useState(() => cutCorner(square4, 0))
  const R = 72
  const max = 128
  const n = angles.length
  // Side i lies on the tangent line at angles[i]; corner i joins sides i and i + 1.
  const gaps = angles.map((a, i) => (i + 1 < n ? angles[i + 1] : angles[0] + 2 * Math.PI) - a)
  const corners: Vec[] = angles.map((a, i) => {
    const mid = a + gaps[i] / 2
    const d = R / Math.cos(gaps[i] / 2)
    return [d * Math.cos(mid), -d * Math.sin(mid)]
  })
  const excess = gaps.reduce((sum, g) => sum + Math.tan(g / 2), 0) / Math.PI - 1
  const biggest = gaps.indexOf(Math.max(...gaps))
  const outline = `M${corners.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' L')} Z`

  return (
    <figure className="not-prose my-10">
      <div className="mx-auto max-w-xs">
        <svg viewBox="-80 -80 160 160" className="w-full" role="img"
          aria-label={`A disk inside its best box and inside a polygon with ${n} sides`}>
          <rect x={-R} y={-R} width={2 * R} height={2 * R} style={tightStyle} />
          <circle r={R} style={exactStyle} />
          <path d={outline} style={zonoStyle} />
          {corners.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={n <= 16 ? 10 : 5}
              style={{ fill: 'transparent', cursor: n < max ? 'pointer' : 'default' }}
              onClick={() => {
                if (n < max) setAngles(cutCorner(angles, i))
              }} />
          ))}
          {n <= 16
            ? corners.map((p, i) => (
                <circle key={`dot${i}`} cx={p[0]} cy={p[1]} r={2.2} style={{ fill: ink(0.85), pointerEvents: 'none' }} />
              ))
            : null}
        </svg>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={`${buttonClass} disabled:opacity-40`} disabled={n >= max}
            onClick={() => setAngles(cutCorner(angles, biggest))}>
            Cut the biggest corner
          </button>
          <button type="button" className={buttonClass} onClick={() => setAngles(square4)}>
            Start over
          </button>
        </div>
        <Legend
          items={[
            { swatch: swatch.exact, text: 'The disk.' },
            { swatch: swatch.tight, text: 'Its best box, the square that touches it on four sides.' },
            {
              swatch: swatch.zono,
              text: (
                <span className="tabular-nums">
                  A polygon around the disk with {n} sides, {(100 * excess).toPrecision(2)}% larger than the disk.
                </span>
              ),
            },
          ]}
        />
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Every cut is a line tangent to the disk, so the polygon shrinks and still contains the disk. Click a corner to
        cut it, or let the button pick the biggest one. However many sides the polygon has, another cut is possible.
      </figcaption>
    </figure>
  )
}

// ---------------------------------------------------------------------------
// Preface and chapter 1 additions

/** Sign-gradient attack on the margin (the same loop as the Python in chapter 1). */
function attackMargin(eps: number) {
  let x: Vec = [C[0], C[1]]
  const row = [W2[0][0] - W2[1][0], W2[0][1] - W2[1][1]] // d(o1 - o2)/dh = (1, -2)
  for (let k = 0; k < 40; k++) {
    const z = mul(W1, x)
    const on = [z[0] > 0 ? 1 : 0, z[1] > 0 ? 1 : 0]
    const g: Vec = [
      row[0] * on[0] * W1[0][0] + row[1] * on[1] * W1[1][0],
      row[0] * on[0] * W1[0][1] + row[1] * on[1] * W1[1][1],
    ]
    x = [
      clamp(x[0] - 0.01 * Math.sign(g[0]), C[0] - eps, C[0] + eps),
      clamp(x[1] - 0.01 * Math.sign(g[1]), C[1] - eps, C[1] + eps),
    ]
  }
  return { x, m: marginAt(x) }
}

/** Chapter 1: attacks bound the smallest margin from above, verifiers from below. */
export function TwoSides() {
  const [eps, setEps] = React.useState(0.08)
  const lower = 0.6 - 10 * eps // interval arithmetic, chapter 2
  const found = attackMargin(eps)
  const range: [number, number] = [-1.5, 0.8]
  const L = 16
  const R = 344
  const sx = (v: number) => L + ((v - range[0]) / (range[1] - range[0])) * (R - L)
  const y = 62
  const uid = useUid()
  const verdict =
    lower > 1e-9
      ? 'Proved: even the lower bound is positive, so no input in the square flips the label.'
      : found.m < -1e-9
        ? `Counterexample: the attack found x = (${fmt(found.x[0])}, ${fmt(found.x[1])}), where the margin is ${fmt(found.m)}.`
        : 'Unknown: the lower bound is negative, and the attack found no input that flips the label.'

  return (
    <figure className="not-prose my-10">
      <div className="mx-auto max-w-lg">
        <svg viewBox="0 0 360 120" className="w-full" role="img"
          aria-label="A number line for the smallest margin, with the lower bound from a verifier and the value found by an attack">
          <defs>
            <pattern id={`${uid}-h`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" style={{ stroke: ink(0.22), strokeWidth: 1.4 }} />
            </pattern>
          </defs>
          <rect x={sx(range[0])} y={y - 22} width={sx(0) - sx(range[0])} height={44} style={{ fill: `url(#${uid}-h)` }} />
          <line x1={L} x2={R} y1={y} y2={y} style={{ stroke: ink(0.5) }} />
          {[-1.5, -1, -0.5, 0, 0.5].map((t) => (
            <g key={t}>
              <line x1={sx(t)} x2={sx(t)} y1={y - 3} y2={y + 3} style={{ stroke: ink(0.5) }} />
              <text x={sx(t)} y={y + 36} textAnchor="middle" className="fill-muted-foreground text-[10px]">{t}</text>
            </g>
          ))}
          <line x1={sx(0)} x2={sx(0)} y1={y - 22} y2={y + 22} style={{ stroke: ink(0.6) }} />
          <rect x={sx(lower)} y={y - 7} width={Math.max(0, sx(found.m) - sx(lower))} height={14}
            style={{ fill: accent(0.16), stroke: accent(0.6) }} />
          <line x1={sx(lower)} x2={sx(lower)} y1={y - 16} y2={y + 16} style={{ stroke: ink(0.9), strokeWidth: 1.5, strokeDasharray: '3 2' }} />
          <circle cx={sx(found.m)} cy={y} r={5} style={{ fill: 'oklch(var(--background))', stroke: accent(1), strokeWidth: 2 }} />
          <text x={sx(lower)} y={y - 22} textAnchor="middle" className="fill-foreground text-[11px]">lower bound</text>
          <text x={sx(found.m)} y={y + 24} textAnchor="middle" className="fill-foreground text-[11px]">attack</text>
          <text x={sx(-0.75)} y={14} textAnchor="middle" className="fill-muted-foreground text-[11px]">margin ≤ 0: label flips</text>
          <text x={sx(0.4)} y={14} textAnchor="middle" className="fill-muted-foreground text-[11px]">margin &gt; 0: label A</text>
        </svg>
        <div className="mt-2">
          <Slider label="ε" value={eps} min={0.02} max={0.2} step={0.01} onChange={setEps} />
        </div>
        <p className="mt-2 text-sm tabular-nums">
          Lower bound {fmt(lower)}, best attack {fmt(found.m)}. {verdict}
        </p>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        The smallest margin over the square is somewhere in the shaded bracket. A verifier (here the interval
        arithmetic of chapter 2) pushes the left end up, an attack pushes the right end down. On this tiny network the
        attack happens to land on the true worst input. On real networks it usually doesn't, and the bracket is wider.
      </figcaption>
    </figure>
  )
}

/** Preface: a rough map of the methods, by cost and by what they can prove. */
export function MethodMap() {
  const X = (v: number) => 54 + v * 320
  const Y = (v: number) => 236 - v * 200
  const dots = [
    { name: 'Boxes', ch: 2, x: 0.04, y: 0.12, dx: 8, dy: 4, anchor: 'start' },
    { name: 'Zonotopes', ch: 4, x: 0.18, y: 0.38, dx: 8, dy: 4, anchor: 'start' },
    { name: 'DeepPoly, CROWN', ch: 5, x: 0.27, y: 0.52, dx: 8, dy: 4, anchor: 'start' },
    { name: 'α-CROWN', ch: 5, x: 0.38, y: 0.62, dx: -8, dy: -6, anchor: 'end' },
    { name: 'Triangle LP', ch: 7, x: 0.56, y: 0.69, dx: 2, dy: 18, anchor: 'start' },
    { name: 'Tropical polyhedra', ch: 6, x: 0.46, y: 0.42, dx: 8, dy: 4, anchor: 'start' },
    { name: 'MILP, SMT', ch: 7, x: 0.94, y: 0.97, dx: 4, dy: 26, anchor: 'end' },
  ]
  const bab = `M${X(0.38)},${Y(0.62)} C${X(0.55)},${Y(0.86)} ${X(0.75)},${Y(0.95)} ${X(0.94)},${Y(0.97)}`

  return (
    <figure className="not-prose my-10">
      <div className="mx-auto max-w-xl">
        <svg viewBox="0 0 390 290" className="w-full" role="img"
          aria-label="A rough map of verification methods: cheaper methods prove less, exact methods cost exponential time">
          <defs>
            <marker id="mm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" style={{ fill: ink(0.7) }} />
            </marker>
          </defs>
          <line x1={X(0)} x2={X(1)} y1={Y(0)} y2={Y(0)} style={{ stroke: ink(0.5) }} markerEnd="url(#mm-arrow)" />
          <line x1={X(0)} x2={X(0)} y1={Y(0)} y2={Y(1.06)} style={{ stroke: ink(0.5) }} markerEnd="url(#mm-arrow)" />
          <text x={X(0.5)} y={Y(0) + 34} textAnchor="middle" className="fill-foreground text-[12px] italic">cost</text>
          <text x={X(0)} y={Y(0) + 16} textAnchor="start" className="fill-muted-foreground text-[10px]">two forward passes</text>
          <text x={X(1)} y={Y(0) + 16} textAnchor="end" className="fill-muted-foreground text-[10px]">exponential</text>
          <text x={16} y={Y(0.5)} textAnchor="middle" transform={`rotate(-90 16 ${Y(0.5)})`}
            className="fill-foreground text-[12px] italic">what it can prove</text>
          <line x1={X(0)} x2={X(1)} y1={Y(1)} y2={Y(1)} style={{ stroke: accent(0.7), strokeDasharray: '4 3' }} />
          <text x={X(0.02)} y={Y(1) - 6} className="fill-muted-foreground text-[10px]">everything that is true</text>
          <path d={bab} style={{ fill: 'none', stroke: accent(1), strokeWidth: 1.6, strokeDasharray: '5 3' }} markerEnd="url(#mm-arrow)" />
          <text x={X(0.6)} y={Y(0.9) - 4} textAnchor="end" className="fill-foreground text-[11px]">branch and bound · 8</text>
          <line x1={X(0.1)} x2={X(0.1)} y1={Y(0.2)} y2={Y(0.33)} style={{ stroke: ink(0.6), strokeWidth: 1.2 }} markerEnd="url(#mm-arrow)" />
          <text x={X(0.1) - 4} y={Y(0.27)} textAnchor="end" className="fill-muted-foreground text-[10px]">training · 9</text>
          {dots.map((d) => (
            <g key={d.name}>
              <circle cx={X(d.x)} cy={Y(d.y)} r={4} style={{ fill: d.ch === 6 ? 'oklch(var(--background))' : ink(0.85), stroke: ink(0.85), strokeWidth: 1.3 }} />
              <text x={X(d.x) + d.dx} y={Y(d.y) + d.dy} textAnchor={d.anchor as 'start' | 'end'} className="fill-foreground text-[11px]">
                {d.name} · {d.ch}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        A rough map, not a measurement, with chapter numbers. Moving right costs time; moving up proves more. Branch and
        bound trades one for the other until it reaches the exact answer. Tropical polyhedra (open dot) make a
        different trade: they are not convex, so they are not simply better or worse than the shapes around them.
        Training moves every point up for the networks it produces.
      </figcaption>
    </figure>
  )
}

// ---------------------------------------------------------------------------
// Chapter 4

/** A zonotope is the image of the noise square: one choice of noise values is one point in every layer. */
export function NoiseLink() {
  const eps = 0.1
  const [eta, setEta] = React.useState<Vec>([0.5, -0.5])
  const dragging = React.useRef(false)
  const x: Vec = [C[0] + eps * eta[0], C[1] + eps * eta[1]]
  const z = mul(W1, x)
  const o = mul(W2, relu(z))
  const m = o[0] - o[1]
  const diamond = square(C, eps).map((p) => mul(W1, p))
  const outputs = diamond.map((p) => mul(W2, relu(p)))
  const set = (p: Vec) => setEta([clamp(p[0], -1, 1), clamp(p[1], -1, 1)])
  const dot = (s: Scale, p: Vec) => (
    <circle cx={s.sx(p[0])} cy={s.sy(p[1])} r={5}
      style={{ fill: accent(1), stroke: 'oklch(var(--background))', strokeWidth: 1.5, pointerEvents: 'none' }} />
  )
  const sign = (v: number) => (v < 0 ? '−' : '+')

  return (
    <figure className="not-prose my-10">
      <div className="grid gap-2 sm:grid-cols-3">
        <Plot x={[-1.3, 1.3]} y={[-1.3, 1.3]} title="1. Noise symbols" xLabel="η₁" yLabel="η₂" xTicks={[-1, 0, 1]}
          yTicks={[-1, 0, 1]} label="The noise square, with the chosen noise values">
          {(s) => {
            const toData = (e: React.PointerEvent<SVGElement>): Vec | null => {
              const matrix = e.currentTarget.ownerSVGElement?.getScreenCTM()
              if (!matrix) return null
              const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse())
              return [s.ix(p.x), s.iy(p.y)]
            }
            return (
              <>
                <path d={s.path(square([0, 0], 1))} style={{ fill: accent(0.1), stroke: accent(0.8), strokeWidth: 1.3 }} />
                <line x1={s.sx(-1.3)} x2={s.sx(1.3)} y1={s.sy(0)} y2={s.sy(0)} style={{ stroke: ink(0.15) }} />
                <line x1={s.sx(0)} x2={s.sx(0)} y1={s.sy(-1.3)} y2={s.sy(1.3)} style={{ stroke: ink(0.15) }} />
                <rect x={s.sx(-1.3)} y={s.sy(1.3)} width={s.sx(1.3) - s.sx(-1.3)} height={s.sy(-1.3) - s.sy(1.3)}
                  style={{ fill: 'transparent', cursor: 'crosshair', touchAction: 'none' }}
                  onPointerDown={(e) => {
                    const p = toData(e)
                    if (!p) return
                    e.currentTarget.setPointerCapture(e.pointerId)
                    dragging.current = true
                    set(p)
                  }}
                  onPointerMove={(e) => {
                    if (!dragging.current) return
                    const p = toData(e)
                    if (p) set(p)
                  }}
                  onPointerUp={() => {
                    dragging.current = false
                  }}
                  onPointerCancel={() => {
                    dragging.current = false
                  }} />
                <circle cx={s.sx(eta[0])} cy={s.sy(eta[1])} r={6} tabIndex={0} role="slider"
                  aria-label="Noise values. Drag in the square, or use the arrow keys."
                  aria-valuetext={`eta1 ${fmt(eta[0])}, eta2 ${fmt(eta[1])}`}
                  style={{ fill: accent(1), stroke: 'oklch(var(--background))', strokeWidth: 1.5, pointerEvents: 'none' }}
                  onKeyDown={(e) => {
                    const d: Record<string, Vec> = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }
                    const step = d[e.key]
                    if (!step) return
                    e.preventDefault()
                    set([eta[0] + step[0], eta[1] + step[1]])
                  }} />
              </>
            )
          }}
        </Plot>
        <Plot x={[0.5, 1.5]} y={[-0.3, 0.7]} title="2. Hidden values" xLabel="h₁" yLabel="h₂" xTicks={[0.6, 1, 1.4]}
          yTicks={[-0.2, 0.2, 0.6]} label="The hidden values, with the point produced by the chosen noise values">
          {(s) => (
            <>
              <path d={s.path(diamond)} style={exactStyle} />
              {dot(s, relu(z))}
            </>
          )}
        </Plot>
        <Plot x={[1.2, 2.4]} y={[0.6, 1.8]} title="3. Outputs" xLabel="o₁" yLabel="o₂" xTicks={[1.4, 1.8, 2.2]}
          yTicks={[0.8, 1.2, 1.6]} label="The outputs, with the point produced by the chosen noise values">
          {(s) => (
            <>
              <Unsafe s={s} a={[-1, 1]} b={0} />
              <path d={s.path(outputs)} style={exactStyle} />
              {dot(s, o)}
            </>
          )}
        </Plot>
      </div>
      <div className="mx-auto mt-3 max-w-xl space-y-1 text-sm tabular-nums">
        <p>
          η = ({fmt(eta[0])}, {fmt(eta[1])}) gives x = ({fmt(x[0], 3)}, {fmt(x[1], 3)}), then h = ({fmt(z[0], 3)},{' '}
          {fmt(z[1], 3)}) and o = ({fmt(o[0], 3)}, {fmt(o[1], 3)}).
        </p>
        <p>
          Margin: 0.6 − 0.1·η₁ + 0.3·η₂ = 0.6 {sign(-0.1 * eta[0])} {fmt(Math.abs(0.1 * eta[0]), 3)}{' '}
          {sign(0.3 * eta[1])} {fmt(Math.abs(0.3 * eta[1]), 3)} = {fmt(m, 3)}
        </p>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        At ε = 0.1. Drag the point in the left square, or click anywhere in it. The same two noise values decide the
        input, the hidden values and the outputs, so the three points move together. The margin is smallest at the
        corner η = (1, −1).
      </figcaption>
    </figure>
  )
}

/** A zonotope is a sum of segments, one per noise symbol. */
export function ZonotopeSum() {
  const gens: Vec[] = [
    [0.9, 0.25],
    [0.2, 0.8],
    [0.55, -0.45],
    [-0.35, 0.4],
  ]
  const [k, setK] = React.useState(3)
  const uid = useUid()
  const shape = zonotopePolygon([0, 0], gens.slice(0, k))
  const before = k > 1 ? zonotopePolygon([0, 0], gens.slice(0, k - 1)) : null
  const names = ['g₁', 'g₂', 'g₃', 'g₄']

  return (
    <figure className="not-prose my-10">
      <div className="mx-auto max-w-sm">
        <Plot x={[-2.2, 2.2]} y={[-2.2, 2.2]} size={280} xLabel="first coordinate" yLabel="second coordinate"
          xTicks={[-2, -1, 0, 1, 2]} yTicks={[-2, -1, 0, 1, 2]} label={`A zonotope built from ${k} segments`}>
          {(s) => (
            <>
              <defs>
                <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7"
                  orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 Z" style={{ fill: accent(1) }} />
                </marker>
              </defs>
              {before ? <path d={s.path(before)} style={{ fill: 'none', stroke: ink(0.4), strokeDasharray: '1.5 3' }} /> : null}
              <path d={s.path(shape)} style={{ ...zonoStyle, fill: ink(0.06) }} />
              {gens.slice(0, k).map((g, i) => (
                <g key={i}>
                  <line x1={s.sx(0)} y1={s.sy(0)} x2={s.sx(g[0])} y2={s.sy(g[1])}
                    style={{ stroke: accent(1), strokeWidth: 1.6 }} markerEnd={`url(#${uid}-arrow)`} />
                  <text x={s.sx(g[0] * 1.18)} y={s.sy(g[1] * 1.18) + 4} textAnchor="middle"
                    className="fill-foreground text-[11px]">{names[i]}</text>
                </g>
              ))}
              <circle cx={s.sx(0)} cy={s.sy(0)} r={2.5} style={{ fill: ink(0.9) }} />
            </>
          )}
        </Plot>
        <div className="mt-3">
          <Choice label="noise symbols" options={[1, 2, 3, 4]} value={k} onChange={setK} />
        </div>
        <p className="mt-2 text-sm">
          {k === 1
            ? 'One noise symbol: c + η₁g₁ with η₁ between −1 and 1 is a segment.'
            : `${k} noise symbols: ${k} pairs of parallel sides, and the shape is symmetric around its centre.`}
        </p>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        The arrows are the generators, the columns of G. Each one sweeps the previous shape (dotted) along its own
        direction, which adds one pair of parallel sides.
      </figcaption>
    </figure>
  )
}

/** Three ways to cover the graph of ReLU over [l, u]: a box, the zonotope parallelogram, and the triangle. */
export function ReluRelax() {
  const [eps, setEps] = React.useState(0.2)
  const l = 0.2 - 2 * eps
  const u = 0.2 + 2 * eps
  const lam = u / (u - l)
  const mu = (-lam * l) / 2
  const box = rect([l, u], [0, u])
  const para: Poly = [
    [l, lam * l],
    [u, lam * u],
    [u, u],
    [l, 0],
  ]
  const tri: Poly = [
    [l, 0],
    [0, 0],
    [u, u],
  ]
  const below = clip(para, [0, -1], 0)

  return (
    <figure className="not-prose my-10">
      <div className="mx-auto max-w-sm">
        <Plot x={[-0.35, 0.75]} y={[-0.25, 0.85]} size={280} xLabel="z₂ (input of the ReLU)" yLabel="h₂ (output)"
          xTicks={[-0.2, 0, 0.2, 0.4, 0.6]} yTicks={[0, 0.2, 0.4, 0.6, 0.8]}
          label="The graph of ReLU over an interval, covered by a box, a parallelogram and a triangle">
          {(s) => (
            <>
              <line x1={s.sx(-1)} x2={s.sx(1)} y1={s.sy(0)} y2={s.sy(0)} style={{ stroke: ink(0.25) }} />
              <line x1={s.sx(0)} x2={s.sx(0)} y1={s.sy(-1)} y2={s.sy(1)} style={{ stroke: ink(0.25) }} />
              <path d={s.path(tri)} style={{ fill: accent(0.16), stroke: 'none' }} />
              <path d={s.path(below)} style={{ fill: s.hatch }} />
              <path d={s.path(box)} style={boxStyle} />
              <path d={s.path(para)} style={zonoStyle} />
              <path d={`M${s.sx(-0.35)},${s.sy(0)} L${s.sx(0)},${s.sy(0)} L${s.sx(0.75)},${s.sy(0.75)}`}
                style={{ fill: 'none', stroke: accent(0.35), strokeWidth: 1 }} />
              <path d={`M${s.sx(l)},${s.sy(0)} L${s.sx(0)},${s.sy(0)} L${s.sx(u)},${s.sy(u)}`}
                style={{ fill: 'none', stroke: accent(1), strokeWidth: 2.2 }} />
            </>
          )}
        </Plot>
        <div className="mt-3">
          <Slider label="ε" value={eps} min={0.11} max={0.25} step={0.01} onChange={setEps} />
        </div>
        <p className="mt-2 text-sm tabular-nums">
          z₂ ranges over [{fmt(l)}, {fmt(u)}], slope λ = {fmt(lam, 3)}, half height μ = {fmt(mu, 3)}.
        </p>
        <Legend
          items={[
            { swatch: swatch.box, text: <span className="tabular-nums">Box: area {fmt((u - l) * u, 3)}</span> },
            { swatch: swatch.zono, text: <span className="tabular-nums">Zonotope parallelogram: area {fmt(-l * u, 3)}</span> },
            {
              swatch: <rect x="1" y="1" width="20" height="10" style={{ fill: accent(0.16) }} />,
              text: <span className="tabular-nums">Triangle, the smallest convex cover: area {fmt((-l * u) / 2, 3)}</span>,
            },
            { swatch: swatch.unsafe, text: 'Part of the parallelogram below zero, where no ReLU output can be' },
          ]}
        />
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        The thick line is ReLU over the range of z₂ in our network. Every shape has to contain it. The parallelogram
        is always exactly twice the area of the triangle, and its lower side dips below zero.
      </figcaption>
    </figure>
  )
}
