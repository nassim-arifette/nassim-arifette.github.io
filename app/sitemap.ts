import type { MetadataRoute } from 'next'
import { allSeries } from 'contentlayer/generated'
import { absoluteUrl } from '@/lib/seo'
import { getPublishedPosts, getAllProjects } from '@/lib/content'
import { getTagAggregates } from '@/lib/tags'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes = ['/', '/projects', '/hackathons', '/blog', '/cv', '/tags', '/series'].map((path) => ({
    url: absoluteUrl(path === '/' ? '/' : path),
    lastModified: now,
  }))

  const postRoutes = getPublishedPosts().map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
  }))

  const projectRoutes = getAllProjects().map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: new Date(project.date),
  }))

  const seriesRoutes = allSeries.map((series) => ({
    url: absoluteUrl(series.url),
    lastModified: now,
  }))

  const tagRoutes = getTagAggregates().map((tag) => {
    const dates = [...tag.posts, ...tag.projects].map((entry) => +new Date(entry.date))
    const lastModified = dates.length > 0 ? new Date(Math.max(...dates)) : now
    return {
      url: absoluteUrl(`/tags/${tag.slug}`),
      lastModified,
    }
  })

  return [...staticRoutes, ...postRoutes, ...projectRoutes, ...seriesRoutes, ...tagRoutes]
}
