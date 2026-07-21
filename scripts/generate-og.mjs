import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const CANVAS = { width: 1200, height: 630 }
const SITE_NAME = 'Nassim Arifette'
const BACKGROUND = 'linear-gradient(135deg, #faf7ef 0%, #f2eadc 100%)'
const INK = '#101722'
const MUTED_INK = '#52606f'
const SIGNAL = '#155fc2'
const RULE = '#d2c8b7'
const ANNOTATION = '#b8662c'
const RESERVED_BASENAME = 'default'

async function loadContentlayer() {
  try {
    const [postsSource, projectsSource] = await Promise.all([
      fs.readFile(path.join(rootDir, '.contentlayer', 'generated', 'Post', '_index.json'), 'utf8'),
      fs.readFile(path.join(rootDir, '.contentlayer', 'generated', 'Project', '_index.json'), 'utf8'),
    ])
    return {
      posts: JSON.parse(postsSource),
      projects: JSON.parse(projectsSource),
    }
  } catch (error) {
    throw new Error(
      `Unable to load Contentlayer data. Run "npm run content:build" first.\n${
        error instanceof Error ? error.message : error
      }`,
    )
  }
}

async function fetchFont(family, weight) {
  const cssFamily = family.replace(/ /g, '+')
  const cssUrl = `https://fonts.googleapis.com/css2?family=${cssFamily}:wght@${weight}&display=swap`
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; og-generator/1.0)',
    Accept: 'text/css,*/*;q=0.1',
  }

  const cssResponse = await fetch(cssUrl, { headers })
  if (!cssResponse.ok) {
    throw new Error(`Failed to fetch ${family} ${weight} CSS: ${cssResponse.status} ${cssResponse.statusText}`)
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
  return { name: family, data: fontBuffer, weight, style: 'normal' }
}

let fontCache
async function getFonts() {
  if (fontCache) return fontCache
  fontCache = await Promise.all([
    fetchFont('Instrument Sans', 600),
    fetchFont('Newsreader', 600),
  ])
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
        color: INK,
        background: BACKGROUND,
        overflow: 'hidden',
        fontFamily: 'Instrument Sans',
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
                  letterSpacing: '-0.02em',
                  fontWeight: 600,
                  color: INK,
                  fontFamily: 'Newsreader',
                  width: 400,
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
                    borderRadius: 2,
                    border: `1px solid ${SIGNAL}`,
                    background: 'rgba(21,95,194,0.04)',
                    color: SIGNAL,
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
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
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: '-0.035em',
              color: INK,
              maxWidth: '1000px',
              fontFamily: 'Newsreader',
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
                  color: MUTED_INK,
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
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.22)',
                      border: `1px solid ${RULE}`,
                      fontSize: 19,
                      fontWeight: 600,
                      color: MUTED_INK,
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
              borderRadius: 8,
              border: `1px solid ${RULE}`,
              pointerEvents: 'none',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: 64,
              right: 64,
              top: 126,
              height: 1,
              background: RULE,
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              width: 390,
              height: 390,
              right: -125,
              bottom: -180,
              borderRadius: 9999,
              border: '1px solid rgba(21,95,194,0.16)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              width: 245,
              height: 245,
              right: -15,
              bottom: -105,
              borderRadius: 9999,
              border: '1px solid rgba(21,95,194,0.13)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              width: 13,
              height: 13,
              right: 112,
              bottom: 101,
              borderRadius: 9999,
              background: ANNOTATION,
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

async function removeStaleOgImages(ogDir, expectedBasenames) {
  const entries = await fs.readdir(ogDir, { withFileTypes: true })
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.png'))
      .filter((entry) => !expectedBasenames.has(entry.name.slice(0, -4)))
      .map((entry) => fs.unlink(path.join(ogDir, entry.name))),
  )
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
      typeLabel: 'Research note',
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

  await writeOgImage(
    path.join(ogDir, `${RESERVED_BASENAME}.png`),
    buildOgTree({
      title: 'Building systems that preserve structure on difficult data.',
      typeLabel: 'Research portfolio',
      metaLine: 'Machine learning · computer vision · reliable systems',
      tags: [],
    }),
  )

  const expectedBasenames = new Set([RESERVED_BASENAME])
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
    expectedBasenames.add(base)
    written += 1
  }

  await removeStaleOgImages(ogDir, expectedBasenames)

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
