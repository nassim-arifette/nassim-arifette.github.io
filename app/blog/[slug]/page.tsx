import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { allPosts } from 'contentlayer/generated'
import { Mdx } from '@/components/mdx/mdx-client'

interface PageProps { params: { slug: string } }

export async function generateStaticParams() {
  return allPosts.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = allPosts.find((p) => p.slug === params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
  }
}

export default function PostPage({ params }: PageProps) {
  const post = allPosts.find((p) => p.slug === params.slug)
  if (!post) return notFound()

  return (
    <article className="prose">
      <h1>{post.title}</h1>
      <p className="text-sm !mt-0 !mb-6 text-muted-foreground">
        {new Date(post.date).toLocaleDateString()}
      </p>
      <Mdx code={post.body.code} />
    </article>
  )
}

