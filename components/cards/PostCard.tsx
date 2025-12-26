import type { Post } from 'contentlayer/generated'
import { getPreviewText } from '@/lib/preview'
import { getSeriesPartForPostSlug } from '@/lib/series'
import Link from 'next/link'
import { TagLink } from '@/components/tags/TagLink'

export function PostCard({ post }: { post: Post }) {
  const preview = getPreviewText(post.body?.raw, post.description)
  const seriesPart = getSeriesPartForPostSlug(post.slug)

  return (
    <article className="group relative block overflow-hidden rounded-lg border bg-card p-5 transition duration-200 ease-out hover:-translate-y-1 hover:border-foreground/40 hover:shadow-lg">
      <Link href={post.url} className="absolute inset-0 z-10" aria-label={`Read ${post.title}`}>
        <span className="sr-only">Read {post.title}</span>
      </Link>
      <div className="relative">
        {seriesPart ? (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rounded-full border border-border px-2 py-0.5 leading-none">Series</span>
            <span className="max-w-[180px] truncate text-muted-foreground">{seriesPart.series.title}</span>
            {seriesPart.index > 0 ? (
              <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] tracking-wide text-muted-foreground/80">
                Part {seriesPart.index + 1}
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <h3 className="text-lg font-medium leading-tight">{post.title}</h3>
          <span className="shrink-0 text-xs text-muted-foreground sm:text-right">
            {new Date(post.date).toLocaleDateString()}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
        {post.tags?.length ? (
          <div className="relative z-20 mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <TagLink
                key={tag}
                tag={tag}
                variant="secondary"
                className="transition hover:text-foreground"
              />
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
    </article>
  )
}
