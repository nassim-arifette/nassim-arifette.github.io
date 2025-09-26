import Link from 'next/link'
import { allPosts } from 'contentlayer/generated'

export const metadata = {
  title: 'Blog',
  description: 'Notes and posts',
}

export default function BlogIndex() {
  const posts = [...allPosts]
    .filter((p) => p.published !== false)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Blog</h1>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.slug} className="group">
            <Link href={post.url} className="block">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-medium group-hover:underline">{post.title}</h2>
                <span className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

