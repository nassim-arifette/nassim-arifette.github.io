import Link from 'next/link'
import type { Post } from 'contentlayer/generated'
import { Badge } from '@/components/ui/badge'
import { getPreviewText } from '@/lib/preview'

export function PostCard({ post }: { post: Post }) {
  const preview = getPreviewText(post.body?.raw, post.description)

  return (
    <Link
      href={post.url}
      className="group relative block overflow-hidden rounded-lg border bg-card p-5 transition duration-200 ease-out hover:-translate-y-1 hover:border-foreground/40 hover:shadow-lg"
    >
      <div className="relative z-10">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <h3 className="text-lg font-medium leading-tight">{post.title}</h3>
          <span className="shrink-0 text-xs text-muted-foreground sm:text-right">
            {new Date(post.date).toLocaleDateString()}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
        {post.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
        ) : null}
      </div>

      {preview && (
        <div className="pointer-events-none absolute inset-0 z-20 translate-y-2 opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <div className="flex h-full flex-col justify-between rounded-lg border border-border/80 bg-background/95 p-5 text-sm text-muted-foreground shadow-lg backdrop-blur">
            <p className="max-h-40 overflow-hidden">{preview}</p>
            <span className="mt-4 text-xs font-medium text-foreground/70">Read post →</span>
          </div>
        </div>
      )}
    </Link>
  )
}

