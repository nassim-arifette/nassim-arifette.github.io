import { allPosts, allProjects, type Post, type Project } from 'contentlayer/generated'

type ContentIndex = {
  posts: Post[]
  projects: Project[]
  publishedPosts: Post[]
  postsBySlug: Map<string, Post>
  projectsBySlug: Map<string, Project>
}

let cachedIndex: ContentIndex | null = null

function sortByDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

function buildIndex(): ContentIndex {
  const posts = sortByDateDesc(allPosts)
  const publishedPosts = posts.filter((post) => post.published !== false)
  const projects = sortByDateDesc(allProjects)

  const postsBySlug = new Map(posts.map((post) => [post.slug, post] as const))
  const projectsBySlug = new Map(projects.map((project) => [project.slug, project] as const))

  return {
    posts,
    projects,
    publishedPosts,
    postsBySlug,
    projectsBySlug,
  }
}

function getIndex() {
  if (!cachedIndex) {
    cachedIndex = buildIndex()
  }
  return cachedIndex
}

export function getAllPosts() {
  return getIndex().posts
}

export function getPublishedPosts() {
  return getIndex().publishedPosts
}

export function getAllProjects() {
  return getIndex().projects
}

export function getPostBySlug(slug: string) {
  return getIndex().postsBySlug.get(slug)
}

export function getPublishedPostBySlug(slug: string) {
  const post = getPostBySlug(slug)
  if (!post || post.published === false) return undefined
  return post
}

export function getProjectBySlug(slug: string) {
  return getIndex().projectsBySlug.get(slug)
}
