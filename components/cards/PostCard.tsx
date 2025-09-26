import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type Post = {
  title: string
  date: string
  description: string
  tags?: string[]
  url: string
  slug: string
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={post.url} className="block rounded-lg border p-5 hover:bg-accent">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-medium leading-tight">{post.title}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
      {post.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
      ) : null}
    </Link>
  )
}

