import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const CANVAS = { width: 1200, height: 630 }
const SITE_NAME = 'Nassim Arifette'
const BACKGROUND = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #111827 100%)'
const RESERVED_BASENAME = 'default'

async function loadContentlayer() {
  const contentlayerUrl = pathToFileURL(path.join(rootDir, '.contentlayer', 'generated', 'index.mjs')).href
  try {
    const { allPosts = [], allProjects = [] } = await import(contentlayerUrl)
    return { posts: allPosts, projects: allProjects }
  } catch (error) {
    throw new Error(
      `Unable to load Contentlayer data from .contentlayer/generated/index.mjs. Run "next build" first.\n${
        error instanceof Error ? error.message : error
      }`,
    )
  }
}

async function fetchFont(weight) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; og-generator/1.0)',
    Accept: 'text/css,*/*;q=0.1',
  }

  const cssResponse = await fetch(cssUrl, { headers })
  if (!cssResponse.ok) {
    throw new Error(`Failed to fetch Inter ${weight} CSS: ${cssResponse.status} ${cssResponse.statusText}`)
  }
  const css = await cssResponse.text()
  const fontUrlMatch = css.match(/https:[^')]+/)
  if (!fontUrlMatch) {
    throw new Error(`Unable to find font URL in Google Fonts CSS for weight ${weight}`)
  }

  const fontResponse = await fetch(fontUrlMatch[0], { headers })
  if (!fontResponse.ok) {
    throw new Error(`Failed to fetch Inter ${weight} font: ${fontResponse.status} ${fontResponse.statusText}`)
  }

  const fontBuffer = Buffer.from(await fontResponse.arrayBuffer())
  return { name: 'Inter', data: fontBuffer, weight, style: 'normal' }
}

let fontCache
async function getFonts() {
  if (fontCache) return fontCache
  fontCache = await Promise.all([fetchFont(600), fetchFont(800)])
  return fontCache
}

function clampTags(tags = [], max = 5) {
  return tags.filter(Boolean).slice(0, max)
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch (error) {
    return ''
  }
}

function safeSlug(slug) {
  const cleaned = slug.replace(/[^a-zA-Z0-9-_]/g, '-')
  return cleaned || RESERVED_BASENAME
}

function buildOgTree({ title, typeLabel, metaLine, tags }) {
  return {
    type: 'div',
    props: {
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        padding: '64px',
        color: '#e2e8f0',
        background: BACKGROUND,
        overflow: 'hidden',
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 26,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    color: '#cbd5e1',
                  },
                  children: SITE_NAME,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 18px',
                    borderRadius: 9999,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#f8fafc',
                    fontSize: 20,
                    fontWeight: 700,
                  },
                  children: typeLabel,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.08,
              color: '#f8fafc',
              maxWidth: '1000px',
            },
            children: title,
          },
        },
        metaLine
          ? {
              type: 'div',
              props: {
                style: {
                  fontSize: 26,
                  fontWeight: 600,
                  color: '#cbd5e1',
                },
                children: metaLine,
              },
            }
          : null,
        tags?.length
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginTop: 8,
                  maxWidth: '1000px',
                },
                children: tags.map((tag) => ({
                  type: 'div',
                  props: {
                    style: {
                      padding: '10px 14px',
                      borderRadius: 9999,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      fontSize: 22,
                      fontWeight: 600,
                      color: '#e2e8f0',
                    },
                    children: `#${tag}`,
                  },
                })),
              },
            }
          : null,
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              inset: 30,
              borderRadius: 28,
              border: '1px solid rgba(255,255,255,0.08)',
              pointerEvents: 'none',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              width: 420,
              height: 420,
              right: -80,
              top: -60,
              background: 'radial-gradient(circle at center, rgba(124,58,237,0.25), rgba(14,165,233,0) 60%)',
              filter: 'blur(2px)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              width: 380,
              height: 380,
              left: -120,
              bottom: -80,
              background: 'radial-gradient(circle at center, rgba(14,165,233,0.22), rgba(124,58,237,0) 60%)',
              filter: 'blur(2px)',
            },
          },
        },
      ].filter(Boolean),
    },
  }
}

async function renderOgImage(tree) {
  const svg = await satori(tree, {
    width: CANVAS.width,
    height: CANVAS.height,
    fonts: await getFonts(),
  })

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: CANVAS.width },
    background: 'transparent',
  })

  return resvg.render().asPng()
}

async function writeOgImage(targetPath, tree) {
  const png = await renderOgImage(tree)
  await fs.mkdir(path.dirname(targetPath), { recursive: true })
  await fs.writeFile(targetPath, png)
}

async function generateAll() {
  const { posts, projects } = await loadContentlayer()
  const ogDir = path.join(rootDir, 'public', 'og')

  const postEntries = (posts ?? [])
    .filter((post) => post.published !== false)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      metaLine: formatDate(post.date),
      tags: clampTags(post.tags),
      typeLabel: 'Blog post',
    }))

  const projectEntries = (projects ?? []).map((project) => ({
    slug: project.slug,
    title: project.title,
    metaLine: formatDate(project.date),
    tags: clampTags(project.tags),
    typeLabel: 'Project',
  }))

  const entries = [...postEntries, ...projectEntries]
  if (entries.length === 0) {
    console.log('No posts or projects found; skipping OG generation.')
    return
  }

  let written = 0
  for (const entry of entries) {
    const base = safeSlug(entry.slug || `og-${written + 1}`)
    if (base === RESERVED_BASENAME) {
      console.warn('Skipping reserved basename "default" to avoid overwriting your fallback image.')
      continue
    }
    const tree = buildOgTree(entry)
    const filename = `${base}.png`
    const targetPath = path.join(ogDir, filename)
    await writeOgImage(targetPath, tree)
    written += 1
  }

  console.log(`Generated ${written} social image${written === 1 ? '' : 's'} in ${path.relative(rootDir, ogDir)}`)
}

async function main() {
  try {
    await generateAll()
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  }
}

await main()
