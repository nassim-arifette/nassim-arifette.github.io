'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AmbientLight,
  Box3,
  BoxGeometry,
  Color,
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three'
import { ArrowUpRight } from 'lucide-react'
import { formatDate } from '@/lib/mdx'
import { cn } from '@/lib/utils'

type HouseNode = {
  slug: string
  title: string
  description: string
  url: string
  tags?: string[]
  placement?: string
  winner?: boolean
  date?: string
  kind: 'project' | 'hackathon'
}

type PositionedHouseNode = HouseNode & { x: number; z: number }

type HouseGameProps = {
  projects: Omit<HouseNode, 'kind'>[]
  hackathons: Omit<HouseNode, 'kind'>[]
  onExit: () => void
}

type KeyState = Record<string, boolean>

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export function HouseGame({ projects, hackathons, onExit }: HouseGameProps) {
  const router = useRouter()
  const mountRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<WebGLRenderer | null>(null)
  const cameraRef = useRef<PerspectiveCamera | null>(null)
  const keysRef = useRef<KeyState>({})
  const yawRef = useRef(0)
  const pitchRef = useRef(0)
  const velocityRef = useRef(new Vector3())
  const [nearest, setNearest] = useState<PositionedHouseNode | null>(null)
  const [ready, setReady] = useState(false)

  const nodes = useMemo<PositionedHouseNode[]>(() => {
    const projectNodes = projects.map((p, index) => ({
      ...p,
      kind: 'project' as const,
      x: (index % 3) * 220 - 220,
      z: -Math.floor(index / 3) * 180 - 40,
    }))
    const hackNodes = hackathons.map((p, index) => ({
      ...p,
      kind: 'hackathon' as const,
      x: 360 + (index % 2) * 150,
      z: -index * 170 - 120,
    }))
    return [...projectNodes, ...hackNodes]
  }, [projects, hackathons])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new Scene()
    scene.background = new Color(0x05070a)

    const camera = new PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.1, 2000)
    camera.position.set(0, 24, 120)
    camera.lookAt(new Vector3(0, 16, 0))
    cameraRef.current = camera

    const renderer = new WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = SRGBColorSpace
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambient = new AmbientLight(0xffffff, 0.35)
    scene.add(ambient)

    const mainLight = new PointLight(0xffffff, 1.1, 1200)
    mainLight.position.set(0, 200, 120)
    scene.add(mainLight)

    const accent = new PointLight(0x63f4c7, 0.9, 800)
    accent.position.set(-240, 160, -120)
    scene.add(accent)

    const accent2 = new PointLight(0xfbbf24, 0.8, 800)
    accent2.position.set(320, 130, -200)
    scene.add(accent2)

    const floorGeo = new PlaneGeometry(2400, 2400)
    const floorMat = new MeshStandardMaterial({
      color: new Color(0x0b1220),
      roughness: 0.8,
      metalness: 0.1,
    })
    const floor = new Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = 0
    floor.receiveShadow = true
    scene.add(floor)

    const grid = new GridHelper(1200, 32, 0x1e293b, 0x1e293b)
    grid.position.y = 0.1
    scene.add(grid)

    const wallMaterial = new MeshStandardMaterial({
      color: new Color(0x0f172a),
      roughness: 0.7,
      metalness: 0.05,
      emissive: new Color(0x0b0f1a),
      emissiveIntensity: 0.3,
    })

    const walls: Mesh[] = []
    const wallGeo = new BoxGeometry(1600, 120, 20)
    const wallBack = new Mesh(wallGeo, wallMaterial)
    wallBack.position.set(0, 60, -860)
    walls.push(wallBack)

    const wallFront = new Mesh(wallGeo, wallMaterial)
    wallFront.position.set(0, 60, 280)
    walls.push(wallFront)

    const wallSideGeo = new BoxGeometry(20, 120, 1200)
    const wallLeft = new Mesh(wallSideGeo, wallMaterial)
    wallLeft.position.set(-520, 60, -280)
    walls.push(wallLeft)

    const wallRight = new Mesh(wallSideGeo, wallMaterial)
    wallRight.position.set(520, 60, -280)
    walls.push(wallRight)

    const dividerGeo = new BoxGeometry(12, 100, 600)
    const divider = new Mesh(dividerGeo, wallMaterial)
    divider.position.set(220, 50, -220)
    walls.push(divider)

    walls.forEach((mesh) => {
      mesh.castShadow = false
      mesh.receiveShadow = true
      scene.add(mesh)
    })

    const colliders = walls.map((mesh) => new Box3().setFromObject(mesh))

    const nodeMeshMatProject = new MeshStandardMaterial({
      color: new Color(0x34d399),
      emissive: new Color(0x34d399),
      emissiveIntensity: 0.6,
      roughness: 0.4,
    })
    const nodeMeshMatHack = new MeshStandardMaterial({
      color: new Color(0xfacc15),
      emissive: new Color(0xfbbf24),
      emissiveIntensity: 0.7,
      roughness: 0.35,
    })
    const nodeGeo = new BoxGeometry(28, 8, 18)

    const nodeColliders: { box: Box3; node: PositionedHouseNode }[] = []
    nodes.forEach((node) => {
      const mat = node.kind === 'hackathon' ? nodeMeshMatHack : nodeMeshMatProject
      const mesh = new Mesh(nodeGeo, mat)
      mesh.position.set(node.x, 4, node.z)
      mesh.castShadow = true
      scene.add(mesh)
      const labelHeight = node.kind === 'hackathon' ? 18 : 12
      const collider = new Box3().setFromCenterAndSize(
        new Vector3(node.x, 6, node.z),
        new Vector3(32, labelHeight, 40),
      )
      nodeColliders.push({ box: collider, node })
    })

    const interactDistance = 50

    let animationFrame: number
    const clock = { prev: performance.now() }

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current || !mountRef.current) return
      const { clientWidth, clientHeight } = mountRef.current
      rendererRef.current.setSize(clientWidth, clientHeight)
      cameraRef.current.aspect = clientWidth / clientHeight
      cameraRef.current.updateProjectionMatrix()
    }
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement) return
      const sensitivity = 0.0016
      yawRef.current -= event.movementX * sensitivity
      pitchRef.current = clamp(pitchRef.current - event.movementY * sensitivity, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1)
    }

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement
      setReady(locked)
    }

    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('pointerlockchange', handlePointerLockChange)

    const updateNearest = () => {
      if (!cameraRef.current) return
      let best: PositionedHouseNode | null = null
      let bestDist = interactDistance
      for (const entry of nodeColliders) {
        const dx = entry.node.x - cameraRef.current.position.x
        const dz = entry.node.z - cameraRef.current.position.z
        const dist = Math.hypot(dx, dz)
        if (dist < bestDist) {
          best = entry.node
          bestDist = dist
        }
      }
      setNearest(best)
    }

    const step = () => {
      const now = performance.now()
      const delta = Math.min((now - clock.prev) / 1000, 0.05)
      clock.prev = now

      if (cameraRef.current) {
        const cam = cameraRef.current
        const moveSpeed = 80
        const dir = new Vector3()

        const forward = keysRef.current['w'] || keysRef.current['arrowup'] || keysRef.current['z']
        const backward = keysRef.current['s'] || keysRef.current['arrowdown']
        const left = keysRef.current['a'] || keysRef.current['arrowleft'] || keysRef.current['q']
        const right = keysRef.current['d'] || keysRef.current['arrowright']

        if (forward) dir.z -= 1
        if (backward) dir.z += 1
        if (left) dir.x -= 1
        if (right) dir.x += 1
        if (dir.lengthSq() > 0) dir.normalize()

        const yaw = yawRef.current
        const sin = Math.sin(yaw)
        const cos = Math.cos(yaw)
        const moveX = dir.x * cos - dir.z * sin
        const moveZ = dir.x * sin + dir.z * cos

        velocityRef.current.x = moveX * moveSpeed
        velocityRef.current.z = moveZ * moveSpeed

        const nextPos = cam.position.clone()
        nextPos.x += velocityRef.current.x * delta
        nextPos.z += velocityRef.current.z * delta

        const playerBox = new Box3().setFromCenterAndSize(
          new Vector3(nextPos.x, 16, nextPos.z),
          new Vector3(24, 60, 24),
        )

        const collision = colliders.some((box) => box.intersectsBox(playerBox))
        if (!collision) {
          cam.position.copy(nextPos)
        }

        cam.position.x = clamp(cam.position.x, -500, 500)
        cam.position.z = clamp(cam.position.z, -780, 260)

        cam.rotation.set(pitchRef.current, yawRef.current, 0)
        cam.lookAt(
          cam.position.x + Math.sin(yawRef.current) * Math.cos(pitchRef.current),
          cam.position.y + Math.sin(pitchRef.current),
          cam.position.z - Math.cos(yawRef.current) * Math.cos(pitchRef.current),
        )
      }

      updateNearest()
      renderer.render(scene, camera)
      animationFrame = requestAnimationFrame(step)
    }

    clock.prev = performance.now()
    animationFrame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [nodes])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      keysRef.current[key] = true
      if ((key === 'enter' || key === ' ') && nearest) {
        event.preventDefault()
        router.push(nearest.url)
      }
      if (key === 'escape') {
        event.preventDefault()
        onExit()
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      keysRef.current[key] = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [nearest, onExit, router])

  const requestLock = useCallback(() => {
    const renderer = rendererRef.current
    if (!renderer) return
    renderer.domElement.requestPointerLock()
  }, [])

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full overflow-hidden rounded-xl border border-border bg-black" />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
        <div className="flex items-center justify-between p-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-background/60 px-3 py-1">WASD / arrows to move</span>
            <span className="rounded-full border border-border bg-background/60 px-3 py-1">Enter / Space to open</span>
            <span className="rounded-full border border-border bg-background/60 px-3 py-1">Esc to exit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-border bg-background/60 px-3 py-1">Pointer lock for mouse look</div>
            <button
              type="button"
              onClick={onExit}
              className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-border bg-background/70 px-2 py-1 text-[11px] font-medium transition hover:border-foreground/40"
            >
              Exit
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
            {ready ? 'Mouse look enabled' : 'Click to enable mouse look'}
          </div>
          <button
            type="button"
            onClick={requestLock}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-md border border-border bg-background/80 px-3 py-1 text-xs font-medium transition hover:border-foreground/40"
          >
            Enable mouse
          </button>
        </div>
      </div>

      {nearest ? (
        <div className="pointer-events-none absolute left-1/2 top-4 w-full max-w-xl -translate-x-1/2 rounded-xl border border-border bg-background/90 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {nearest.kind === 'hackathon' ? 'Hackathon trophy' : 'Project'}
              </p>
              <h3 className="text-lg font-semibold text-foreground">{nearest.title}</h3>
              <p className="text-xs text-muted-foreground">{nearest.date ? formatDate(nearest.date) : 'Undated'}</p>
            </div>
            <div className="rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Enter / Space to open
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{nearest.description}</p>
          {nearest.tags && nearest.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {nearest.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide',
                    nearest.kind === 'hackathon' ? 'border-amber-300/60 text-amber-200' : 'border-emerald-300/60 text-emerald-200',
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground/90">
            Approach and press Enter
            <ArrowUpRight size={14} />
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute left-1/2 top-4 w-full max-w-xl -translate-x-1/2 rounded-xl border border-border bg-background/90 p-4 text-sm text-muted-foreground shadow-lg backdrop-blur">
          Walk closer to a pedestal to interact.
        </div>
      )}
    </div>
  )
}
