import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { getPublishedPosts, getAllProjects } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes = ['/', '/projects', '/blog', '/cv'].map((path) => ({
    url: absoluteUrl(path),
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

  return [...staticRoutes, ...postRoutes, ...projectRoutes]
}
