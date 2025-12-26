import Link from 'next/link'
import { badgeClasses } from '@/components/ui/badge'
import { slugifyTag } from '@/lib/utils'

type TagLinkProps = {
  tag: string
  className?: string
  variant?: 'default' | 'secondary'
  showHash?: boolean
  prefetch?: boolean
}

export function TagLink({
  tag,
  className = '',
  variant = 'secondary',
  showHash = false,
  prefetch,
}: TagLinkProps) {
  const cleaned = tag.trim()
  const slug = slugifyTag(cleaned)
  if (!slug) return null

  return (
    <Link
      href={`/tags/${slug}`}
      className={badgeClasses(variant, className)}
      aria-label={`View content tagged ${cleaned}`}
      prefetch={prefetch}
    >
      {showHash ? `#${cleaned}` : cleaned}
    </Link>
  )
}
