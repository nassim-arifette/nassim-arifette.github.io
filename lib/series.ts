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

function buildSeriesIndex(): SeriesIndex {
  const postsBySlug = new Map<string, Post>()
  for (const post of allPosts) {
    postsBySlug.set(post.slug, post)
  }

  const seriesList: SeriesResolved[] = []
  const bySeriesSlug = new Map<string, SeriesResolved>()
  const byPostSlug = new Map<string, SeriesPartResolved>()

  for (const series of allSeries) {
    const total = series.parts.length
    const resolvedParts: SeriesPartResolved[] = series.parts.map((part, index) => {
      const post = postsBySlug.get(part.slug)
      const hasPublishedPost = Boolean(post && post.published !== false)
      const isComingSoon = part.comingSoon === true || !hasPublishedPost
      const readingMinutes =
        part.manualReadingMinutes ??
        (hasPublishedPost && post?.body?.raw ? estimateReadingTimeMinutes(post.body.raw) : undefined)

      const title = part.title ?? post?.title ?? `Part ${index + 1}`
      const summary = part.summary ?? post?.description

      const resolved: SeriesPartResolved = {
        series,
        index,
        total,
        slug: part.slug,
        title,
        summary,
        isComingSoon,
        post: hasPublishedPost ? post : undefined,
        readingMinutes,
        manualReadingMinutes: part.manualReadingMinutes,
      }

      if (hasPublishedPost && !part.comingSoon) {
        byPostSlug.set(post!.slug, resolved)
      }

      return resolved
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
