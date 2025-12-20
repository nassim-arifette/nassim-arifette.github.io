'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

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

type HouseGameProps = {
  projects: HouseNode[]
  hackathons: HouseNode[]
  onExit: () => void
}

type TileType =
  | 'grass'
  | 'path'
  | 'water'
  | 'soil'
  | 'wood'
  | 'wall'
  | 'roof'
  | 'fence'
  | 'tree'
  | 'door'
  | 'gate'
  | 'void'

type WorldObjectKind = 'project' | 'trophy'

type WorldObject = {
  kind: WorldObjectKind
  node: HouseNode
  tx: number
  ty: number
  tw: number
  th: number
}

type Plant = {
  plantedAt: number
}

const STORAGE_KEY = 'mini_world_plants_v2'

const TILE_SIZE = 16
const PLAYER_RADIUS = 5
const PLAYER_SPEED = 62 // world px / sec

const PLANT_GROWTH_MS = 25_000
const PLANT_MAX_STAGE = 3

const GAME_MINUTES_PER_SECOND = 4
const START_MINUTE_OF_DAY = 6 * 60

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function hash2(x: number, y: number, seed: number) {
  let h = x * 374761393 + y * 668265263 + seed * 69069
  h = (h ^ (h >> 13)) * 1274126177
  return ((h ^ (h >> 16)) >>> 0) / 4294967296
}

function getPlantStage(plant: Plant, nowMs: number) {
  const age = nowMs - plant.plantedAt
  return clamp(Math.floor(age / PLANT_GROWTH_MS), 0, PLANT_MAX_STAGE)
}

function formatClock(minuteOfDay: number) {
  const minute = ((minuteOfDay % (24 * 60)) + 24 * 60) % (24 * 60)
  const hour24 = Math.floor(minute / 60)
  const mins = minute % 60
  const am = hour24 < 12
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  const padded = mins.toString().padStart(2, '0')
  return `${hour12}:${padded} ${am ? 'AM' : 'PM'}`
}

function getObjectId(obj: WorldObject) {
  return `${obj.kind}:${obj.node.slug}`
}

export function HouseGame({ projects, hackathons, onExit }: HouseGameProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const keysRef = useRef<Record<string, boolean>>({})
  const plantsRef = useRef<Record<string, Plant>>({})
  const playerRef = useRef({ x: 14 * TILE_SIZE + TILE_SIZE / 2, y: 11 * TILE_SIZE + TILE_SIZE / 2 })
  const nearestRef = useRef<WorldObject | null>(null)
  const soilHintRef = useRef<string | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const viewRef = useRef({ cssW: 0, cssH: 0, dpr: 1, scale: 2, offsetX: 0, offsetY: 0, cameraX: 0, cameraY: 0 })
  const clockRef = useRef({ day: 1, minuteOfDay: START_MINUTE_OF_DAY })
  const lastHudMinuteRef = useRef<number>(-1)

  const [nearest, setNearest] = useState<WorldObject | null>(null)
  const [soilHint, setSoilHint] = useState<string | null>(null)
  const [zone, setZone] = useState<'Farm' | 'Home'>('Farm')
  const [hud, setHud] = useState(() => ({
    day: 1,
    minuteOfDay: START_MINUTE_OF_DAY,
    energy: 100,
    hearts: 10,
  }))

  const world = useMemo(() => {
    const width = 110
    const height = 44

    const tiles: TileType[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => 'grass' as TileType),
    )

    // Separate the outside + the indoor room with a void strip.
    for (let y = 0; y < height; y += 1) {
      for (let x = 72; x <= 77; x += 1) {
        tiles[y][x] = 'void'
      }
    }

    // River on the left side (outside area).
    for (let y = 0; y < height; y += 1) {
      const center = 8 + Math.round(Math.sin(y * 0.22) * 2)
      const halfWidth = 3 + Math.round(Math.sin(y * 0.11) * 1)
      for (let x = 0; x < 72; x += 1) {
        if (Math.abs(x - center) <= halfWidth) tiles[y][x] = 'water'
      }
    }

    // House exterior.
    const house = { x0: 22, y0: 6, w: 18, h: 13, roofH: 6 }
    const outsideDoor = { tx: house.x0 + Math.floor(house.w / 2), ty: house.y0 + house.h - 1 }
    for (let y = house.y0; y < house.y0 + house.h; y += 1) {
      for (let x = house.x0; x < house.x0 + house.w; x += 1) {
        const isRoof = y < house.y0 + house.roofH
        tiles[y][x] = isRoof ? 'roof' : 'wall'
      }
    }
    tiles[outsideDoor.ty][outsideDoor.tx] = 'door'

    // Garden with fence + gate.
    const soilPatch = { x0: 46, y0: 16, w: 12, h: 8 }
    const gate = { tx: soilPatch.x0 + Math.floor(soilPatch.w / 2), ty: soilPatch.y0 + soilPatch.h }

    for (let y = soilPatch.y0; y < soilPatch.y0 + soilPatch.h; y += 1) {
      for (let x = soilPatch.x0; x < soilPatch.x0 + soilPatch.w; x += 1) {
        tiles[y][x] = 'soil'
      }
    }
    for (let x = soilPatch.x0 - 1; x <= soilPatch.x0 + soilPatch.w; x += 1) {
      tiles[soilPatch.y0 - 1][x] = 'fence'
      tiles[soilPatch.y0 + soilPatch.h][x] = 'fence'
    }
    for (let y = soilPatch.y0 - 1; y <= soilPatch.y0 + soilPatch.h; y += 1) {
      tiles[y][soilPatch.x0 - 1] = 'fence'
      tiles[y][soilPatch.x0 + soilPatch.w] = 'fence'
    }
    tiles[gate.ty][gate.tx] = 'gate'

    // Dirt path from house to gate (L shape), and a small porch.
    const pathWidth = 3
    const pathFrom = { tx: outsideDoor.tx, ty: outsideDoor.ty + 1 }
    const pathTo = { tx: gate.tx, ty: gate.ty + 1 }

    for (let y = pathFrom.ty; y <= pathTo.ty; y += 1) {
      for (let ox = -Math.floor(pathWidth / 2); ox <= Math.floor(pathWidth / 2); ox += 1) {
        const x = pathFrom.tx + ox
        if (x < 0 || x >= 72) continue
        if (tiles[y][x] === 'grass') tiles[y][x] = 'path'
      }
    }
    const xStart = Math.min(pathFrom.tx, pathTo.tx)
    const xEnd = Math.max(pathFrom.tx, pathTo.tx)
    for (let x = xStart; x <= xEnd; x += 1) {
      for (let oy = -Math.floor(pathWidth / 2); oy <= Math.floor(pathWidth / 2); oy += 1) {
        const y = pathTo.ty + oy
        if (y < 0 || y >= height) continue
        if (tiles[y][x] === 'grass') tiles[y][x] = 'path'
      }
    }
    for (let i = 1; i <= 2; i += 1) {
      const y = outsideDoor.ty + i
      for (let ox = -1; ox <= 1; ox += 1) {
        const x = outsideDoor.tx + ox
        if (x < 0 || x >= 72) continue
        if (tiles[y][x] === 'grass') tiles[y][x] = 'path'
      }
    }

    // Trees around the outside area edges.
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < 72; x += 1) {
        if (tiles[y][x] !== 'grass') continue
        const edgeBias = x < 5 || x > 72 - 6 || y < 4 || y > height - 5
        const roll = hash2(x, y, 1337)
        if ((edgeBias && roll > 0.86) || roll > 0.985) tiles[y][x] = 'tree'
      }
    }

    // Indoor room (one room) on the right side.
    const room = { x0: 80, y0: 12, w: 30, h: 20 }
    const insideDoor = { tx: room.x0 + Math.floor(room.w / 2), ty: room.y0 + room.h - 1 }
    for (let y = room.y0; y < room.y0 + room.h; y += 1) {
      for (let x = room.x0; x < room.x0 + room.w; x += 1) {
        const isWall = x === room.x0 || x === room.x0 + room.w - 1 || y === room.y0 || y === room.y0 + room.h - 1
        tiles[y][x] = isWall ? 'wall' : 'wood'
      }
    }
    tiles[insideDoor.ty][insideDoor.tx] = 'door'

    const objects: WorldObject[] = []
    const normalizedProjects = [...projects].slice(0, 12)
    const normalizedHackathons = [...hackathons].slice(0, 8)

    // Projects: frames on the left side of the room.
    const projectCols = 3
    const projectStart = { tx: room.x0 + 3, ty: room.y0 + 3 }
    for (let i = 0; i < normalizedProjects.length; i += 1) {
      const col = i % projectCols
      const row = Math.floor(i / projectCols)
      const tx = projectStart.tx + col * 4
      const ty = projectStart.ty + row * 4
      if (tx + 1 >= room.x0 + room.w - 2) break
      if (ty + 1 >= room.y0 + room.h - 3) break
      objects.push({ kind: 'project', node: normalizedProjects[i], tx, ty, tw: 2, th: 2 })
    }

    // Trophies: shelf on the right.
    const trophyCols = 2
    const trophyStart = { tx: room.x0 + room.w - 7, ty: room.y0 + 3 }
    for (let i = 0; i < normalizedHackathons.length; i += 1) {
      const col = i % trophyCols
      const row = Math.floor(i / trophyCols)
      const tx = trophyStart.tx + col * 3
      const ty = trophyStart.ty + row * 4
      if (tx + 1 >= room.x0 + room.w - 2) break
      if (ty + 1 >= room.y0 + room.h - 3) break
      objects.push({ kind: 'trophy', node: normalizedHackathons[i], tx, ty, tw: 2, th: 2 })
    }

    const outsideSpawn = { x: (outsideDoor.tx + 0.5) * TILE_SIZE, y: (outsideDoor.ty + 2.5) * TILE_SIZE }
    const insideSpawn = { x: (insideDoor.tx + 0.5) * TILE_SIZE, y: (insideDoor.ty - 1.5) * TILE_SIZE }

    return { width, height, tiles, objects, outsideDoor, insideDoor, outsideSpawn, insideSpawn }
  }, [projects, hackathons])

  useEffect(() => {
    playerRef.current.x = world.outsideSpawn.x
    playerRef.current.y = world.outsideSpawn.y
    nearestRef.current = null
    soilHintRef.current = null
    setNearest(null)
    setSoilHint(null)
  }, [world.outsideSpawn.x, world.outsideSpawn.y])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, Plant>
      if (!parsed || typeof parsed !== 'object') return
      plantsRef.current = parsed
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (!rect) return
      const dpr = window.devicePixelRatio || 1
      viewRef.current.cssW = rect.width
      viewRef.current.cssH = rect.height
      viewRef.current.dpr = dpr
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.imageSmoothingEnabled = false
    })

    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const savePlants = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plantsRef.current))
      } catch {
        // ignore
      }
    }

    const togglePlant = (tx: number, ty: number) => {
      const key = `${tx},${ty}`
      const tile = world.tiles[ty]?.[tx]
      if (tile !== 'soil') return

      const plant = plantsRef.current[key]
      const now = Date.now()

      if (!plant) {
        plantsRef.current[key] = { plantedAt: now }
        savePlants()
        return
      }

      const stage = getPlantStage(plant, now)
      if (stage >= PLANT_MAX_STAGE) {
        delete plantsRef.current[key]
        savePlants()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        onExit()
        return
      }

      const nearestObj = nearestRef.current
      if ((e.key === 'Enter' || e.key === 'e' || e.key === 'E') && nearestObj) {
        e.preventDefault()
        router.push(nearestObj.node.url)
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        const p = playerRef.current
        const tx = Math.floor(p.x / TILE_SIZE)
        const ty = Math.floor(p.y / TILE_SIZE)
        togglePlant(tx, ty)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown, { passive: false })
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onExit, router, world.tiles])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const cssX = e.clientX - rect.left
      const cssY = e.clientY - rect.top
      const view = viewRef.current
      const worldX = view.cameraX + (cssX - view.offsetX) / view.scale
      const worldY = view.cameraY + (cssY - view.offsetY) / view.scale
      const tx = Math.floor(worldX / TILE_SIZE)
      const ty = Math.floor(worldY / TILE_SIZE)

      const p = playerRef.current
      const centerX = tx * TILE_SIZE + TILE_SIZE / 2
      const centerY = ty * TILE_SIZE + TILE_SIZE / 2
      const dist2 = (p.x - centerX) * (p.x - centerX) + (p.y - centerY) * (p.y - centerY)
      if (dist2 > (TILE_SIZE * 3) ** 2) return

      const key = `${tx},${ty}`
      const tile = world.tiles[ty]?.[tx]
      if (tile !== 'soil') return

      if (!plantsRef.current[key]) {
        plantsRef.current[key] = { plantedAt: Date.now() }
      } else {
        const stage = getPlantStage(plantsRef.current[key], Date.now())
        if (stage >= PLANT_MAX_STAGE) delete plantsRef.current[key]
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plantsRef.current))
      } catch {
        // ignore
      }
    }

    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [world.tiles])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isWalkable = (x: number, y: number) => {
      const tx = Math.floor(x / TILE_SIZE)
      const ty = Math.floor(y / TILE_SIZE)
      if (tx < 0 || ty < 0 || tx >= world.width || ty >= world.height) return false
      const tile = world.tiles[ty][tx]
      return !['wall', 'roof', 'water', 'fence', 'tree', 'void'].includes(tile)
    }

    const drawTile = (tx: number, ty: number, tile: TileType, nowMs: number) => {
      const x = tx * TILE_SIZE
      const y = ty * TILE_SIZE

      if (tile === 'grass') {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? '#49b54f' : '#41aa47'
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        const s = hash2(tx, ty, 1)
        if (s > 0.92) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
          ctx.fillRect(x + 3, y + 4, 1, 1)
          ctx.fillRect(x + 11, y + 10, 1, 1)
        } else if (s > 0.86) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.10)'
          ctx.fillRect(x + 6, y + 3, 1, 2)
          ctx.fillRect(x + 9, y + 9, 1, 2)
        }
        return
      }

      if (tile === 'path') {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? '#d9b47a' : '#d1a96e'
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        const r = hash2(tx, ty, 19)
        ctx.fillStyle = r > 0.5 ? 'rgba(0, 0, 0, 0.10)' : 'rgba(255, 255, 255, 0.10)'
        ctx.fillRect(x + 4, y + 6, 2, 2)
        ctx.fillRect(x + 11, y + 10, 1, 1)
        return
      }

      if (tile === 'water') {
        ctx.fillStyle = '#1d6be0'
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        const phase = (nowMs / 260 + tx * 2 + ty) % 10
        const waveY = y + 4 + (phase > 5 ? 1 : 0)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.30)'
        ctx.fillRect(x + 2, waveY, TILE_SIZE - 4, 1)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
        ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2)
        return
      }

      if (tile === 'soil') {
        ctx.fillStyle = '#6a3f22'
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
        ctx.fillRect(x + 1, y + 4, TILE_SIZE - 2, 1)
        ctx.fillRect(x + 1, y + 9, TILE_SIZE - 2, 1)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.fillRect(x + 2, y + 5, 1, 1)
        ctx.fillRect(x + 12, y + 11, 1, 1)
        return
      }

      if (tile === 'wood') {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? '#9a6236' : '#915a32'
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
        ctx.fillRect(x, y, 1, TILE_SIZE)
        ctx.fillRect(x + TILE_SIZE - 1, y, 1, TILE_SIZE)
        ctx.fillRect(x, y + 7, TILE_SIZE, 1)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.10)'
        ctx.fillRect(x + 2, y + 2, 1, 1)
        return
      }

      if (tile === 'wall') {
        ctx.fillStyle = '#e2e8f0'
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
        ctx.fillRect(x, y + TILE_SIZE - 3, TILE_SIZE, 3)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
        ctx.fillRect(x, y, 1, TILE_SIZE)
        ctx.fillRect(x + TILE_SIZE - 1, y, 1, TILE_SIZE)
        return
      }

      if (tile === 'roof') {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? '#c03a2b' : '#b73628'
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
        ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.10)'
        ctx.fillRect(x + 2, y + 3, TILE_SIZE - 4, 1)
        ctx.fillRect(x + 2, y + 8, TILE_SIZE - 4, 1)
        return
      }

      if (tile === 'fence') {
        // fence drawn on top of grass
        drawTile(tx, ty, 'grass', nowMs)
        ctx.fillStyle = '#8b5a2b'
        ctx.fillRect(x + 2, y + 3, 2, TILE_SIZE - 6)
        ctx.fillRect(x + TILE_SIZE - 4, y + 3, 2, TILE_SIZE - 6)
        ctx.fillStyle = '#7c4d25'
        ctx.fillRect(x + 4, y + 6, TILE_SIZE - 8, 2)
        ctx.fillRect(x + 4, y + TILE_SIZE - 8, TILE_SIZE - 8, 2)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
        ctx.fillRect(x + 2, y + TILE_SIZE - 4, TILE_SIZE - 4, 2)
        return
      }

      if (tile === 'tree') {
        drawTile(tx, ty, 'grass', nowMs)
        const sway = Math.round(Math.sin((nowMs / 900) + tx * 0.7 + ty * 0.4) * 1)
        ctx.fillStyle = '#7c4a2c'
        ctx.fillRect(x + 7 + sway, y + 8, 2, 7)
        ctx.fillStyle = '#1f7a3a'
        ctx.fillRect(x + 3 + sway, y + 2, 10, 8)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.10)'
        ctx.fillRect(x + 4 + sway, y + 3, 3, 2)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)'
        ctx.fillRect(x + 3 + sway, y + 9, 10, 1)
        return
      }

      if (tile === 'door') {
        // outside vs inside door
        const isOutsideDoor = tx === world.outsideDoor.tx && ty === world.outsideDoor.ty
        drawTile(tx, ty, 'wall', nowMs)
        ctx.fillStyle = '#7c4a2c'
        ctx.fillRect(x + 4, y + (isOutsideDoor ? 4 : 5), 8, isOutsideDoor ? 12 : 11)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
        ctx.fillRect(x + 4, y + 14, 8, 2)
        ctx.fillStyle = isOutsideDoor ? '#f8fafc' : '#fbbf24'
        ctx.fillRect(x + 10, y + 10, 1, 1)
        return
      }

      if (tile === 'gate') {
        drawTile(tx, ty, 'path', nowMs)
        ctx.fillStyle = '#7c4d25'
        ctx.fillRect(x + 1, y + 5, 2, 8)
        ctx.fillRect(x + TILE_SIZE - 3, y + 5, 2, 8)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
        ctx.fillRect(x + 3, y + 10, TILE_SIZE - 6, 2)
        return
      }

      if (tile === 'void') {
        ctx.fillStyle = '#030712'
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        return
      }
    }

    const drawObjects = () => {
      for (const obj of world.objects) {
        const x = obj.tx * TILE_SIZE
        const y = obj.ty * TILE_SIZE
        const w = obj.tw * TILE_SIZE
        const h = obj.th * TILE_SIZE

        if (obj.kind === 'project') {
          ctx.fillStyle = '#5b3a22'
          ctx.fillRect(x, y, w, h)
          ctx.fillStyle = '#0b1220'
          ctx.fillRect(x + 2, y + 2, w - 4, h - 4)
          ctx.fillStyle = '#34d399'
          ctx.fillRect(x + 4, y + 4, w - 8, h - 8)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
          ctx.fillRect(x + 4, y + 4, w - 8, 2)
        } else {
          ctx.fillStyle = '#0b1220'
          ctx.fillRect(x, y, w, h)
          ctx.fillStyle = '#facc15'
          ctx.fillRect(x + 6, y + 6, w - 12, h - 10)
          ctx.fillRect(x + 9, y + 4, w - 18, 3)
          ctx.fillRect(x + 9, y + h - 7, w - 18, 2)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
          ctx.fillRect(x + 6, y + h - 6, w - 12, 2)
        }
      }
    }

    const drawPlants = (nowMs: number) => {
      for (const key of Object.keys(plantsRef.current)) {
        const plant = plantsRef.current[key]
        const [sx, sy] = key.split(',')
        const tx = Number(sx)
        const ty = Number(sy)
        if (!Number.isFinite(tx) || !Number.isFinite(ty)) continue

        const tile = world.tiles[ty]?.[tx]
        if (tile !== 'soil') continue

        const stage = getPlantStage(plant, nowMs)
        const x = tx * TILE_SIZE
        const y = ty * TILE_SIZE

        if (stage === 0) {
          ctx.fillStyle = '#16a34a'
          ctx.fillRect(x + 8, y + 8, 2, 2)
        } else if (stage === 1) {
          ctx.fillStyle = '#22c55e'
          ctx.fillRect(x + 7, y + 7, 2, 6)
          ctx.fillRect(x + 9, y + 9, 2, 4)
        } else if (stage === 2) {
          ctx.fillStyle = '#22c55e'
          ctx.fillRect(x + 6, y + 6, 4, 8)
          ctx.fillRect(x + 10, y + 7, 3, 7)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
          ctx.fillRect(x + 7, y + 7, 1, 2)
        } else {
          ctx.fillStyle = '#fbbf24'
          ctx.fillRect(x + 5, y + 5, 6, 9)
          ctx.fillRect(x + 11, y + 6, 2, 7)
          ctx.fillStyle = '#22c55e'
          ctx.fillRect(x + 6, y + 10, 2, 4)
        }
      }
    }

    const drawPlayer = (nowMs: number, moving: boolean) => {
      const p = playerRef.current
      const bob = moving ? (Math.floor(nowMs / 140) % 2) : 0
      const y = p.y + bob

      // shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
      ctx.beginPath()
      ctx.ellipse(p.x, y + 6, 5, 2, 0, 0, Math.PI * 2)
      ctx.fill()

      // body
      ctx.fillStyle = '#0b1220'
      ctx.fillRect(p.x - 5, y - 6, 10, 11)
      ctx.fillStyle = '#60a5fa'
      ctx.fillRect(p.x - 4, y - 4, 8, 7)
      ctx.fillStyle = '#f8d7b0'
      ctx.fillRect(p.x - 3, y - 6, 6, 3)

      // hat
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(p.x - 5, y - 8, 10, 2)
      ctx.fillStyle = '#a16207'
      ctx.fillRect(p.x - 3, y - 10, 6, 2)
    }

    const computeNearest = () => {
      const p = playerRef.current
      let best: WorldObject | null = null
      let bestDist2 = (TILE_SIZE * 1.3) ** 2

      for (const obj of world.objects) {
        const cx = (obj.tx + obj.tw / 2) * TILE_SIZE
        const cy = (obj.ty + obj.th / 2) * TILE_SIZE
        const dx = p.x - cx
        const dy = p.y - cy
        const d2 = dx * dx + dy * dy
        if (d2 < bestDist2) {
          best = obj
          bestDist2 = d2
        }
      }

      return best
    }

    const updateHints = (nowMs: number) => {
      const nearestObj = computeNearest()
      const prevNearest = nearestRef.current
      const prevId = prevNearest ? getObjectId(prevNearest) : null
      const nextId = nearestObj ? getObjectId(nearestObj) : null
      if (prevId !== nextId) {
        nearestRef.current = nearestObj
        setNearest(nearestObj)
      }

      const p = playerRef.current
      const tx = Math.floor(p.x / TILE_SIZE)
      const ty = Math.floor(p.y / TILE_SIZE)
      const tile = world.tiles[ty]?.[tx]
      if (tile !== 'soil') {
        if (soilHintRef.current !== null) {
          soilHintRef.current = null
          setSoilHint(null)
        }
        return
      }

      const key = `${tx},${ty}`
      const plant = plantsRef.current[key]
      if (!plant) {
        const next = 'Space to plant'
        if (soilHintRef.current !== next) {
          soilHintRef.current = next
          setSoilHint(next)
        }
        return
      }
      const stage = getPlantStage(plant, nowMs)
      if (stage >= PLANT_MAX_STAGE) {
        const next = 'Space to harvest'
        if (soilHintRef.current !== next) {
          soilHintRef.current = next
          setSoilHint(next)
        }
      } else {
        const pct = Math.floor((stage / PLANT_MAX_STAGE) * 100)
        const next = `Growing… ${pct}%`
        if (soilHintRef.current !== next) {
          soilHintRef.current = next
          setSoilHint(next)
        }
      }
    }

    const step = (nowMs: number) => {
      rafRef.current = requestAnimationFrame(step)
      const last = lastFrameRef.current ?? nowMs
      const dt = Math.min(0.05, (nowMs - last) / 1000)
      lastFrameRef.current = nowMs

      const p = playerRef.current
      const keys = keysRef.current
      const up = keys['w'] || keys['W'] || keys['z'] || keys['Z'] || keys['ArrowUp']
      const down = keys['s'] || keys['S'] || keys['ArrowDown']
      const left = keys['a'] || keys['A'] || keys['q'] || keys['Q'] || keys['ArrowLeft']
      const right = keys['d'] || keys['D'] || keys['ArrowRight']

      let dx = 0
      let dy = 0
      if (up) dy -= 1
      if (down) dy += 1
      if (left) dx -= 1
      if (right) dx += 1

      const moving = dx !== 0 || dy !== 0

      if (moving) {
        const len = Math.hypot(dx, dy)
        dx /= len
        dy /= len

        const nextX = p.x + dx * PLAYER_SPEED * dt
        const nextY = p.y + dy * PLAYER_SPEED * dt

        // axis-separated collision, center-based
        const tryX = { x: nextX, y: p.y }
        if (isWalkable(tryX.x, tryX.y)) p.x = tryX.x

        const tryY = { x: p.x, y: nextY }
        if (isWalkable(tryY.x, tryY.y)) p.y = tryY.y

        // keep in bounds
        p.x = clamp(p.x, TILE_SIZE * 0.5, world.width * TILE_SIZE - TILE_SIZE * 0.5)
        p.y = clamp(p.y, TILE_SIZE * 0.5, world.height * TILE_SIZE - TILE_SIZE * 0.5)
      }

      // Teleport between outside door and indoor room.
      {
        const tx = Math.floor(p.x / TILE_SIZE)
        const ty = Math.floor(p.y / TILE_SIZE)
        if (tx === world.outsideDoor.tx && ty === world.outsideDoor.ty) {
          p.x = world.insideSpawn.x
          p.y = world.insideSpawn.y
          nearestRef.current = null
          soilHintRef.current = null
          setNearest(null)
          setSoilHint(null)
        } else if (tx === world.insideDoor.tx && ty === world.insideDoor.ty) {
          p.x = world.outsideSpawn.x
          p.y = world.outsideSpawn.y
          nearestRef.current = null
          soilHintRef.current = null
          setNearest(null)
          setSoilHint(null)
        }
      }

      // Update which area we are in (used by the HUD).
      setZone((prev) => {
        const next = p.x / TILE_SIZE >= 78 ? 'Home' : 'Farm'
        return prev === next ? prev : next
      })

      // Simple in-game clock for the HUD.
      {
        const clock = clockRef.current
        clock.minuteOfDay += dt * GAME_MINUTES_PER_SECOND
        while (clock.minuteOfDay >= 24 * 60) {
          clock.minuteOfDay -= 24 * 60
          clock.day += 1
        }

        const displayMinute = Math.floor(clock.minuteOfDay)
        if (displayMinute !== lastHudMinuteRef.current) {
          lastHudMinuteRef.current = displayMinute
          setHud((prev) => ({ ...prev, day: clock.day, minuteOfDay: displayMinute }))
        }
      }

      // render
      const now = Date.now()
      const view = viewRef.current
      const cssW = Math.max(1, view.cssW)
      const cssH = Math.max(1, view.cssH)
      const worldW = world.width * TILE_SIZE
      const worldH = world.height * TILE_SIZE

      const targetTilesX = 22
      const targetTilesY = 13
      const scale = clamp(Math.floor(Math.min(cssW / (TILE_SIZE * targetTilesX), cssH / (TILE_SIZE * targetTilesY))), 2, 8)
      const viewWorldW = cssW / scale
      const viewWorldH = cssH / scale

      const maxCamX = Math.max(0, worldW - viewWorldW)
      const maxCamY = Math.max(0, worldH - viewWorldH)
      const cameraX = clamp(p.x - viewWorldW / 2, 0, maxCamX)
      const cameraY = clamp(p.y - viewWorldH / 2, 0, maxCamY)

      const offsetX = worldW < viewWorldW ? Math.floor((cssW - worldW * scale) / 2) : 0
      const offsetY = worldH < viewWorldH ? Math.floor((cssH - worldH * scale) / 2) : 0

      view.scale = scale
      view.offsetX = offsetX
      view.offsetY = offsetY
      view.cameraX = cameraX
      view.cameraY = cameraY

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(
        view.dpr * scale,
        0,
        0,
        view.dpr * scale,
        view.dpr * offsetX - view.dpr * scale * cameraX,
        view.dpr * offsetY - view.dpr * scale * cameraY,
      )

      const startTx = clamp(Math.floor(cameraX / TILE_SIZE) - 2, 0, world.width)
      const endTx = clamp(Math.ceil((cameraX + viewWorldW) / TILE_SIZE) + 2, 0, world.width)
      const startTy = clamp(Math.floor(cameraY / TILE_SIZE) - 2, 0, world.height)
      const endTy = clamp(Math.ceil((cameraY + viewWorldH) / TILE_SIZE) + 2, 0, world.height)

      for (let y = startTy; y < endTy; y += 1) {
        for (let x = startTx; x < endTx; x += 1) {
          drawTile(x, y, world.tiles[y][x], now)
        }
      }

      drawPlants(now)
      drawObjects()

      drawPlayer(now, moving)

      updateHints(now)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastFrameRef.current = null
    }
  }, [world])

  const timeLabel = formatClock(hud.minuteOfDay)

  return (
    <div className="relative h-full w-full bg-black">
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      <div className="pointer-events-none absolute inset-0">
        {/* Top-left HUD */}
        <div className="absolute left-4 top-4 space-y-2">
          <div className="flex gap-1 rounded-md border-2 border-black/70 bg-black/40 p-2 backdrop-blur">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className="h-4 w-4 border border-black/60"
                style={{ background: i < hud.hearts ? '#ef4444' : 'rgba(239, 68, 68, 0.25)' }}
              />
            ))}
          </div>
          <div className="w-40 rounded-md border-2 border-black/70 bg-black/40 p-2 backdrop-blur">
            <div className="h-3 w-full border border-black/60 bg-black/60">
              <div className="h-full" style={{ width: `${hud.energy}%`, background: '#22c55e' }} />
            </div>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/80">Energy</p>
          </div>
        </div>

        {/* Top-right HUD */}
        <div className="absolute right-4 top-4 space-y-2 text-right">
          <div className="inline-flex flex-col gap-0.5 rounded-md border-2 border-black/70 bg-amber-200/90 px-3 py-2 text-[11px] font-semibold text-slate-950 shadow">
            <div className="flex items-center justify-between gap-3">
              <span className="uppercase tracking-wide">Day {hud.day}</span>
              <span className="rounded bg-slate-950/10 px-2 py-0.5">{zone}</span>
            </div>
            <span className="font-bold">{timeLabel}</span>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="pointer-events-auto inline-flex items-center justify-center rounded-md border-2 border-black/70 bg-black/40 px-3 py-2 text-xs font-semibold text-white shadow backdrop-blur transition hover:bg-black/60"
          >
            Exit
          </button>
        </div>

        {/* Bottom HUD */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 space-y-2">
          <div className="flex items-center justify-center gap-1 rounded-md border-2 border-black/70 bg-black/40 p-2 backdrop-blur">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className="h-10 w-10 border-2 border-black/70 bg-black/50"
                style={i === 0 ? { outline: '2px solid rgba(250, 204, 21, 0.9)', outlineOffset: '2px' } : undefined}
              />
            ))}
          </div>

          <div className="flex items-end justify-between gap-3 px-1">
            {nearest ? (
              <div className="max-w-sm rounded-md border-2 border-black/70 bg-black/40 px-3 py-2 text-xs text-white/85 shadow backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
                  {nearest.kind === 'trophy' ? 'Trophy' : 'Project'}
                </p>
                <p className="font-semibold text-white">{nearest.node.title}</p>
                <p className="mt-0.5 text-[11px] text-white/70">Press Enter</p>
              </div>
            ) : (
              <div className="rounded-md border-2 border-black/70 bg-black/30 px-3 py-2 text-xs text-white/70 shadow backdrop-blur">
                {zone === 'Home' ? 'Approach a frame/trophy' : 'Walk into the door to enter'}
              </div>
            )}

            {soilHint ? (
              <div className="rounded-md border-2 border-black/70 bg-black/40 px-3 py-2 text-xs text-white/85 shadow backdrop-blur">
                {soilHint}
              </div>
            ) : (
              <div className="rounded-md border-2 border-black/70 bg-black/30 px-3 py-2 text-xs text-white/70 shadow backdrop-blur">
                {zone === 'Farm' ? 'Plant on tilled soil (Space / click)' : 'WASD / ZQSD / arrows'}
              </div>
            )}
          </div>

          <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-white/60">
            WASD / ZQSD / arrows • Enter • Space • Esc
          </p>
        </div>
      </div>
    </div>
  )
}
