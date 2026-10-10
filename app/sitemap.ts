import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'
import { getAllProjects } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes = ['/', '/projects', '/research', '/cv'].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
  }))

  const projectRoutes = getAllProjects().map((project) => ({
    url: absoluteUrl(project.url),
    lastModified: new Date(project.date),
  }))

  return [...staticRoutes, ...projectRoutes]
}
