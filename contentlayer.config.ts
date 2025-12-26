import { defineDocumentType, defineNestedType, makeSource } from 'contentlayer/source-files'
import type { Pluggable } from 'unified'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import GithubSlugger from 'github-slugger'

import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationFocus,
} from '@shikijs/transformers'

const prettyCodeOptions = {
  // Force the dark theme in both modes so syntax colors stay readable on black
  theme: {
    light: 'dark-plus',
    dark: 'dark-plus',
  },
}

// Allow pretty-code data attributes (and inline styles) while keeping sanitation tight
const sanitizeSchema = structuredClone(defaultSchema)
sanitizeSchema.attributes ??= {}
const extraAttributes = [
  ['className'],
  ['data-theme'],
  ['data-line'],
  ['data-highlighted-line'],
  ['data-rehype-pretty-code-fragment'],
  ['data-language'],
  ['aria-hidden'],
  ['role'],
] as const

for (const tag of ['pre', 'code', 'span', 'div'] as const) {
  const tagAttributes = sanitizeSchema.attributes[tag] ?? []
  for (const attr of extraAttributes) {
    const attrName = Array.isArray(attr) ? attr[0] : attr
    const alreadyAllowed = tagAttributes.some((existing) => {
      if (Array.isArray(existing)) {
        return existing[0] === attrName
      }
      return existing === attrName
    })
    if (!alreadyAllowed) {
      tagAttributes.push(attr as any)
    }
  }
  if (tag === 'span') {
    if (!tagAttributes.includes('style' as any)) {
      tagAttributes.push('style' as any)
    }
  }
  sanitizeSchema.attributes[tag] = tagAttributes
}

const anchorAttributes = sanitizeSchema.attributes['a'] ?? []
for (const attr of ['className', 'aria-label', 'data-copy-feedback', 'data-copy-state', 'title'] as const) {
  if (!anchorAttributes.includes(attr as any)) {
    anchorAttributes.push(attr as any)
  }
}
sanitizeSchema.attributes['a'] = anchorAttributes

const mathMLTags = [
  'math',
  'annotation',
  'semantics',
  'mrow',
  'mi',
  'mn',
  'mo',
  'msup',
  'msub',
  'msubsup',
  'mfrac',
  'msqrt',
  'mroot',
  'mstyle',
  'mspace',
  'mtext',
  'mtable',
  'mtr',
  'mtd',
  'mpadded',
  'mphantom',
  'menclose',
  'mover',
  'munder',
  'munderover',
] as const

sanitizeSchema.tagNames ??= []
for (const tag of mathMLTags) {
  if (!sanitizeSchema.tagNames.includes(tag)) {
    sanitizeSchema.tagNames.push(tag)
  }
  const tagAttributes = sanitizeSchema.attributes[tag] ?? []
  const mathAttributes = ['className', 'style'] as const
  for (const attr of mathAttributes) {
    if (!tagAttributes.includes(attr as any)) {
      tagAttributes.push(attr as any)
    }
  }
  if (tag === 'math') {
    for (const attr of ['xmlns', 'display'] as const) {
      if (!tagAttributes.includes(attr as any)) {
        tagAttributes.push(attr as any)
      }
    }
  }
  if (tag === 'annotation') {
    if (!tagAttributes.includes('encoding' as any)) {
      tagAttributes.push('encoding' as any)
    }
  }
  if (tag === 'semantics') {
    if (!tagAttributes.includes('definitionURL' as any)) {
      tagAttributes.push('definitionURL' as any)
    }
  }
  sanitizeSchema.attributes[tag] = tagAttributes
}

const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/[^_]*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    description: { type: 'string', required: true },
    tags: { type: 'list', of: { type: 'string' } },
    published: { type: 'boolean', default: true },
  },
  computedFields: {
    slug: { type: 'string', resolve: (doc) => doc._raw.flattenedPath.replace('posts/', '') },
    url:  { type: 'string', resolve: (doc) => `/blog/${doc._raw.flattenedPath.replace('posts/','')}` },
    headings: {
      type: 'json',
      resolve: (doc) => extractHeadings(doc.body.raw),
    },
  }
}))

const SeriesPart = defineNestedType(() => ({
  name: 'SeriesPart',
  fields: {
    slug: { type: 'string', required: true },
    title: { type: 'string' },
    summary: { type: 'string' },
    comingSoon: { type: 'boolean', default: false },
    manualReadingMinutes: { type: 'number' },
  },
}))

const Series = defineDocumentType(() => ({
  name: 'Series',
  filePathPattern: `posts/**/_series.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    parts: { type: 'list', of: SeriesPart },
    heroNote: { type: 'string' },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) =>
        doc._raw.flattenedPath
          .replace(/^series\//, '')
          .replace(/^posts\//, '')
          .replace(/\/_series$/, ''),
    },
    url: {
      type: 'string',
      resolve: (doc) =>
        `/series/${doc._raw.flattenedPath
          .replace(/^series\//, '')
          .replace(/^posts\//, '')
          .replace(/\/_series$/, '')}`,
    },
    totalParts: { type: 'number', resolve: (doc) => doc.parts?.length ?? 0 },
  },
}))

const Project = defineDocumentType(() => ({
  name: 'Project',
  filePathPattern: `projects/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    description: { type: 'string', required: true },
    links: { type: 'json', required: false }, // { github, website, demo, paper, pdf }
    tags: { type: 'list', of: { type: 'string' } },
    featured: { type: 'boolean', default: false },
    placement: { type: 'string', required: false }, // e.g., "1st place"
    winner: { type: 'boolean', required: false, default: false },
  },
  computedFields: {
    slug: { type: 'string', resolve: (doc) => doc._raw.flattenedPath.replace('projects/','') },
    url:  {
      type: 'string',
      resolve: (doc) => `/projects/${doc._raw.flattenedPath.replace('projects/','')}`,
    },
    headings: {
      type: 'json',
      resolve: (doc) => extractHeadings(doc.body.raw),
    },
  }
}))

const rehypePlugins = [
  // Sanitize first
  [rehypeSanitize, sanitizeSchema] as unknown as Pluggable,

  rehypeSlug as unknown as Pluggable,
  [rehypeAutolinkHeadings, {
    behavior: 'append',
    properties: {
      className: ['heading-anchor'],
      'aria-label': 'Copy link to section',
      title: 'Copy link to section',
    },
    content: [],
  }] as unknown as Pluggable,

  // Then pretty-code
  [rehypePrettyCode, {
    theme: { light: 'dark-plus', dark: 'dark-plus' },
    keepBackground: false,
    transformers: [
      transformerNotationHighlight(),
      transformerNotationDiff(),
      transformerNotationFocus(),
    ],
  }] as unknown as Pluggable,

  rehypeKatex as unknown as Pluggable,
] as Pluggable[]

const remarkPlugins = [remarkMath, remarkGfm] as Pluggable[]

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post, Project, Series],
  mdx: {
    remarkPlugins,
    rehypePlugins,
  },
})

function extractHeadings(raw: string) {
  const slugger = new GithubSlugger()
  const headings: { id: string; title: string; level: number }[] = []
  const lines = raw.split('\n')
  let inCodeBlock = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue
    if (!trimmed.startsWith('#')) continue
    const match = /^(#{2,4})\s+(.+)$/.exec(trimmed)
    if (!match) continue

    const level = match[1].length
    let title = match[2].trim()
    title = title.replace(/\s*\{#.*\}$/, '').trim()
    if (!title) continue

    const id = slugger.slug(title)
    headings.push({ id, title, level })
  }

  return headings
}
