import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
const rehypePrettyCodePlugin: any = rehypePrettyCode
const prettyCodeOptions = {
  // Use VS Code default themes for better contrast
  theme: {
    light: 'light-plus',
    dark: 'dark-plus',
  },
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
    links: { type: 'json', required: false }, // { github, demo, paper, pdf }
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
    ],
  },
})
