import type { Post, Project } from 'contentlayer/generated'
import { getAllProjects, getPublishedPosts } from '@/lib/content'
import { formatDate } from '@/lib/mdx'
import { getPreviewText } from '@/lib/preview'
import { normalizeText } from '@/lib/search'

export type PostListItem = Pick<
  Post,
  'title' | 'date' | 'description' | 'tags' | 'slug' | 'url'
>

export type ProjectCardData = Pick<
  Project,
  'title' | 'date' | 'description' | 'tags' | 'links' | 'slug' | 'url' | 'placement' | 'winner'
> & {
  body?: Pick<Project['body'], 'raw'>
  preview?: string
}

export type CommandSearchEntry = {
  id: string
  group: 'Posts' | 'Projects'
  label: string
  href: string
  description?: string
  info?: string
  keywords: string
  badges?: string[]
}

export function toPostListItem(post: Post): PostListItem {
  return {
    title: post.title,
    date: post.date,
    description: post.description,
    tags: post.tags,
    slug: post.slug,
    url: post.url,
  }
}

export function toProjectCardData(project: Project): ProjectCardData {
  return {
    title: project.title,
    date: project.date,
    description: project.description,
    tags: project.tags,
    links: project.links,
    slug: project.slug,
    url: project.url,
    placement: project.placement,
    winner: project.winner,
    preview: getPreviewText(project.body?.raw, project.description),
  }
}

export function getCommandSearchEntries(): CommandSearchEntry[] {
  const postEntries = getPublishedPosts().map<CommandSearchEntry>((post) => {
    const info = formatDate(post.date)
    return {
      id: `post:${post.slug}`,
      group: 'Posts',
      label: post.title,
      href: post.url,
      description: post.description,
      info,
      badges: (post.tags ?? []).slice(0, 3),
      keywords: normalizeText([post.title, post.description, ...(post.tags ?? []), info].join(' ')),
    }
  })

  const projectEntries = getAllProjects().map<CommandSearchEntry>((project) => {
    const info = formatDate(project.date)
    return {
      id: `project:${project.slug}`,
      group: 'Projects',
      label: project.title,
      href: project.url,
      description: project.description,
      info,
      badges: (project.tags ?? []).slice(0, 3),
      keywords: normalizeText([project.title, project.description, ...(project.tags ?? []), info].join(' ')),
    }
  })

  return [...postEntries, ...projectEntries]
}
