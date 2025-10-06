import type { MetadataRoute } from 'next'
import { allPosts, allProjects } from 'contentlayer/generated'
import { absoluteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes = ['/', '/projects', '/blog', '/cv', '/other'].map((path) => ({
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

  return [...staticRoutes, ...postRoutes, ...projectRoutes]
}

