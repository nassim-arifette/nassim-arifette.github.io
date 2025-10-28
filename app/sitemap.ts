import type { MetadataRoute } from 'next'
import { allPosts, allProjects, allSeries } from 'contentlayer/generated'
import { absoluteUrl } from '@/lib/seo'
import { getTagAggregates } from '@/lib/tags'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes = ['/', '/projects', '/blog', '/series', '/tags', '/cv', '/other'].map((path) => ({
    url: absoluteUrl(path === '/' ? '/' : path),
    lastModified: now,
  }))

  const postRoutes = allPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
  }))

  const projectRoutes = allProjects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: new Date(project.date),
  }))

  const seriesRoutes = allSeries.map((series) => ({
    url: absoluteUrl(series.url),
    lastModified: now,
  }))

  const tagRoutes = getTagAggregates().map((tag) => ({
    url: absoluteUrl(`/tags/${tag.slug}`),
    lastModified: now,
  }))

  return [...staticRoutes, ...postRoutes, ...projectRoutes, ...seriesRoutes, ...tagRoutes]
}
