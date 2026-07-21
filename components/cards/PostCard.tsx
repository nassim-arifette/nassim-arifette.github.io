import type { Post } from 'contentlayer/generated'
import Link from 'next/link'
import { getPreviewText } from '@/lib/preview'
import { getSeriesPartForPostSlug } from '@/lib/series'
import { formatDate } from '@/lib/mdx'
import { TagLink } from '@/components/tags/TagLink'

export function PostCard({ post }: { post: Post }) {
  const preview = getPreviewText(post.body?.raw, post.description)
  const seriesPart = getSeriesPartForPostSlug(post.slug)
  const hasDistinctPreview = Boolean(preview && preview !== post.description)

  return (
    <article className="group border-t border-border/80 py-5 sm:py-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          {seriesPart ? (
            <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-[0.16em] text-foreground">Series</span>
              <span aria-hidden="true">·</span>
              <span>{seriesPart.series.title}</span>
              {seriesPart.index > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Part {seriesPart.index + 1}</span>
                </>
              ) : null}
            </p>
          ) : null}

          <h3 className="text-xl font-semibold leading-snug tracking-[-0.02em]">
            <Link
              href={post.url}
              className="inline-flex rounded-sm py-1 transition-colors hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:items-center"
            >
              {post.title}
            </Link>
          </h3>
        </div>

        <time dateTime={post.date} className="order-first shrink-0 text-xs tabular-nums text-muted-foreground sm:order-none sm:pt-1">
          {formatDate(post.date)}
        </time>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.description}</p>
      {hasDistinctPreview ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/75">{preview}</p>
      ) : null}

      {post.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
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
    </article>
  )
}
