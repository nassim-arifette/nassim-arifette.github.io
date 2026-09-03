import Link from 'next/link'
import type { Post } from 'contentlayer/generated'
import { formatDate } from '@/lib/mdx'

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground">No notes yet.</p>
  }

  return (
    <ul className="divide-y divide-border">
      {posts.map((post) => (
        <li key={post.slug} className="py-4">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-base font-medium leading-snug">
              <Link href={post.url} className="hover:text-accent">
                {post.title}
              </Link>
            </h3>
            <time dateTime={post.date} className="shrink-0 text-sm tabular-nums text-muted-foreground">
              {formatDate(post.date)}
            </time>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{post.description}</p>
        </li>
      ))}
    </ul>
  )
}
