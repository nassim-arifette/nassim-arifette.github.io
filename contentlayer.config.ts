import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
const rehypePrettyCodePlugin: any = rehypePrettyCode
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
] as const

for (const tag of ['pre', 'code', 'span', 'div'] as const) {
  const tagAttributes = sanitizeSchema.attributes[tag] ?? []
  for (const attr of extraAttributes) {
    const alreadyAllowed = tagAttributes.some((existing) =>
      Array.isArray(existing) && Array.isArray(attr)
        ? existing[0] === attr[0]
        : existing === attr
    )
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

const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/*.mdx`,
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
  }
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
  },
  computedFields: {
    slug: { type: 'string', resolve: (doc) => doc._raw.flattenedPath.replace('projects/','') },
    url:  {
      type: 'string',
      resolve: (doc) => `/projects/${doc._raw.flattenedPath.replace('projects/','')}`,
    },
  }
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post, Project],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypePrettyCodePlugin,
        prettyCodeOptions,
      ],
      [rehypeSanitize, sanitizeSchema],
    ],
  },
})
