import { allPosts, allSeries } from 'contentlayer/generated'
import type { Post, Series } from 'contentlayer/generated'
import { estimateReadingTimeMinutes } from '@/lib/mdx'

export interface SeriesPartResolved {
  series: Series
  index: number
  total: number
  slug: string
  title: string
  summary?: string
  isComingSoon: boolean
  readingMinutes?: number
  manualReadingMinutes?: number
  post?: Post
}

export interface SeriesResolved {
  series: Series
  parts: SeriesPartResolved[]
  publishedParts: SeriesPartResolved[]
  startPart?: SeriesPartResolved
}

interface SeriesIndex {
  seriesList: SeriesResolved[]
  bySeriesSlug: Map<string, SeriesResolved>
  byPostSlug: Map<string, SeriesPartResolved>
}

let cachedIndex: SeriesIndex | null = null

function getSeriesSlugFromPostSlug(slug: string) {
  const parts = slug.split('/')
  if (parts.length <= 1) return null
  return parts.slice(0, -1).join('/')
}

function resolveSeriesPartSlug(seriesSlug: string, partSlug: string) {
  if (partSlug.includes('/')) return partSlug
  if (!seriesSlug) return partSlug
  return `${seriesSlug}/${partSlug}`
}

function sortPostsBySeriesOrder(posts: Post[]) {
  return [...posts].sort((a, b) => +new Date(a.date) - +new Date(b.date))
}

function buildSeriesIndex(): SeriesIndex {
  const postsBySlug = new Map<string, Post>()
  for (const post of allPosts) {
    postsBySlug.set(post.slug, post)
  }

  const postsBySeriesSlug = new Map<string, Post[]>()
  for (const post of allPosts) {
    const seriesSlug = getSeriesSlugFromPostSlug(post.slug)
    if (!seriesSlug) continue
    const list = postsBySeriesSlug.get(seriesSlug)
    if (list) {
      list.push(post)
    } else {
      postsBySeriesSlug.set(seriesSlug, [post])
    }
  }

  const seriesList: SeriesResolved[] = []
  const bySeriesSlug = new Map<string, SeriesResolved>()
  const byPostSlug = new Map<string, SeriesPartResolved>()

  for (const series of allSeries) {
    const seriesSlug = series.slug
    const seriesPosts = postsBySeriesSlug.get(seriesSlug) ?? []
    const sortedSeriesPosts = sortPostsBySeriesOrder(seriesPosts)
    const usedSlugs = new Set<string>()
    const resolvedParts: SeriesPartResolved[] = []

    const explicitParts = series.parts ?? []
    if (explicitParts.length > 0) {
      explicitParts.forEach((part, index) => {
        const resolvedSlug = resolveSeriesPartSlug(seriesSlug, part.slug)
        const post = postsBySlug.get(resolvedSlug)
        if (post) {
          usedSlugs.add(post.slug)
        }
        const hasPublishedPost = Boolean(post && post.published !== false)
        const isComingSoon = part.comingSoon === true || !hasPublishedPost
        const readingMinutes =
          part.manualReadingMinutes ??
          (post?.body?.raw ? estimateReadingTimeMinutes(post.body.raw) : undefined)

        const title = part.title ?? post?.title ?? `Part ${index + 1}`
        const summary = part.summary ?? post?.description

        resolvedParts.push({
          series,
          index,
          total: 0,
          slug: resolvedSlug,
          title,
          summary,
          isComingSoon,
          post: hasPublishedPost ? post : undefined,
          readingMinutes,
          manualReadingMinutes: part.manualReadingMinutes,
        })
      })
    }

    for (const post of sortedSeriesPosts) {
      if (usedSlugs.has(post.slug)) continue
      const isComingSoon = post.published === false
      const readingMinutes = post.body?.raw ? estimateReadingTimeMinutes(post.body.raw) : undefined
      resolvedParts.push({
        series,
        index: 0,
        total: 0,
        slug: post.slug,
        title: post.title,
        summary: post.description,
        isComingSoon,
        post: !isComingSoon ? post : undefined,
        readingMinutes,
      })
    }

    const total = resolvedParts.length
    resolvedParts.forEach((part, index) => {
      part.index = index
      part.total = total
      if (part.post && !part.isComingSoon) {
        byPostSlug.set(part.post.slug, part)
      }
    })

    const publishedParts = resolvedParts.filter((part) => part.post && !part.isComingSoon)
    const startPart = publishedParts[0] ?? resolvedParts.find((part) => !part.isComingSoon)

    const resolvedSeries: SeriesResolved = {
      series,
      parts: resolvedParts,
      publishedParts,
      startPart,
    }

    seriesList.push(resolvedSeries)
    bySeriesSlug.set(series.slug, resolvedSeries)
  }

  return { seriesList, bySeriesSlug, byPostSlug }
}

function getSeriesIndex(): SeriesIndex {
  if (!cachedIndex) {
    cachedIndex = buildSeriesIndex()
  }
  return cachedIndex
}

export function listSeries(): SeriesResolved[] {
  return getSeriesIndex().seriesList
}

export function findSeriesBySlug(slug: string): SeriesResolved | undefined {
  return getSeriesIndex().bySeriesSlug.get(slug)
}

export function getSeriesPartForPostSlug(slug: string): SeriesPartResolved | undefined {
  return getSeriesIndex().byPostSlug.get(slug)
}

export interface SeriesNavigation {
  current: SeriesPartResolved
  previous?: SeriesPartResolved
  next?: SeriesPartResolved
}

export function getSeriesNavigation(slug: string): SeriesNavigation | undefined {
  const part = getSeriesPartForPostSlug(slug)
  if (!part) return undefined

  const { parts } = getSeriesIndex().bySeriesSlug.get(part.series.slug) ?? {}
  if (!parts) return undefined

  const prev = parts.slice(0, part.index).reverse().find((entry) => entry.post && !entry.isComingSoon)
  const next = parts.slice(part.index + 1).find((entry) => entry.post && !entry.isComingSoon)

  const navigation: SeriesNavigation = {
    current: part,
    previous: prev,
    next,
  }
  return navigation
}

export function resetSeriesCache() {
  cachedIndex = null
}
