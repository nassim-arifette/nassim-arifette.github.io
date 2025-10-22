import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Feed } from 'feed'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const DEFAULT_SITE_URL = 'https://example.com'
const siteTitle = 'Personal Site'
const siteDescription = 'Clean, fast personal site built with Next.js'
const siteAuthorName = 'Nassim Arifette'

function getEnv(key, fallback = '') {
  const value = process.env[key]
  if (!value) return fallback
  return value.trim()
}

function getSiteUrl() {
  const envUrl = getEnv('NEXT_PUBLIC_SITE_URL') || getEnv('SITE_URL')
  if (!envUrl) return DEFAULT_SITE_URL
  return envUrl.replace(/\/$/, '')
}

function absoluteUrl(pathname) {
  const base = getSiteUrl()
  if (!pathname.startsWith('/')) {
    return `${base}/${pathname}`
  }
  return `${base}${pathname}`
}

async function loadPosts() {
  const contentlayerUrl = pathToFileURL(path.join(rootDir, '.contentlayer', 'generated', 'index.mjs')).href
  try {
    const { allPosts } = await import(contentlayerUrl)
    return Array.isArray(allPosts) ? allPosts : []
  } catch (error) {
    throw new Error(`Unable to load Contentlayer data. Did you run "next build" first?\n${error instanceof Error ? error.message : error}`)
  }
}

async function writeFile(targetPath, contents) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true })
  await fs.writeFile(targetPath, contents, 'utf8')
}

function toFeedItem(post, siteAuthor) {
  const url = absoluteUrl(post.url ?? '/')
  const date = post.date ? new Date(post.date) : new Date()
  return {
    title: post.title ?? url,
    id: url,
    link: url,
    description: post.description ?? '',
    content: post.body?.raw ?? post.description ?? '',
    date,
    published: date,
    author: [siteAuthor],
  }
}

async function generateFeeds() {
  const posts = (await loadPosts())
    .filter((post) => post.published !== false)
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())

  const siteUrl = getSiteUrl()
  const siteAuthor = { name: siteAuthorName, link: siteUrl }
  const feed = new Feed({
    title: siteTitle,
    description: siteDescription,
    id: siteUrl,
    link: siteUrl,
    language: 'en',
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
      json: `${siteUrl}/feed.json`,
    },
    author: siteAuthor,
    updated: posts.length > 0 ? new Date(posts[0].date ?? Date.now()) : new Date(),
  })

  for (const post of posts) {
    feed.addItem(toFeedItem(post, siteAuthor))
  }

  const publicDir = path.join(rootDir, 'public')
  await writeFile(path.join(publicDir, 'feed.xml'), feed.rss2())
  await writeFile(path.join(publicDir, 'feed.json'), feed.json1())

  return posts.length
}

async function main() {
  try {
    const count = await generateFeeds()
    console.log(`Generated RSS and JSON feeds for ${count} post${count === 1 ? '' : 's'}.`)
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  }
}

await main()
