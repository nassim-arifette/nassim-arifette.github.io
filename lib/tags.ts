import { allPosts, allProjects, type Post, type Project } from 'contentlayer/generated'
import { slugifyTag } from '@/lib/utils'

export type TagAggregate = {
  tag: string
  slug: string
  posts: Post[]
  projects: Project[]
}

let cached: TagAggregate[] | null = null

const buildAggregates = (): TagAggregate[] => {
  const map = new Map<string, TagAggregate>()

  const upsert = (tag: string) => {
    const slug = slugifyTag(tag)
    if (!map.has(slug)) {
      map.set(slug, { tag, slug, posts: [], projects: [] })
    }
    return map.get(slug)!
  }

  for (const post of allPosts) {
    if (post.published === false) continue
    for (const rawTag of post.tags ?? []) {
      const cleaned = rawTag.trim()
      if (!cleaned) continue
      const aggregate = upsert(cleaned)
      aggregate.tag = aggregate.tag || cleaned
      aggregate.posts.push(post)
    }
  }

  for (const project of allProjects) {
    for (const rawTag of project.tags ?? []) {
      const cleaned = rawTag.trim()
      if (!cleaned) continue
      const aggregate = upsert(cleaned)
      aggregate.tag = aggregate.tag || cleaned
      aggregate.projects.push(project)
    }
  }

  const entries = Array.from(map.values())
  for (const entry of entries) {
    entry.posts.sort((a, b) => +new Date(b.date) - +new Date(a.date))
    entry.projects.sort((a, b) => +new Date(b.date) - +new Date(a.date))
  }

  return entries.sort((a, b) => a.tag.localeCompare(b.tag))
}

export function getTagAggregates() {
  if (!cached) {
    cached = buildAggregates()
  }
  return cached
}

export function getTagAggregate(slug: string) {
  return getTagAggregates().find((aggregate) => aggregate.slug === slug)
}
