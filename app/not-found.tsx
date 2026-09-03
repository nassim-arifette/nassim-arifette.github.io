import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you’re looking for doesn’t exist.</p>
      <p className="mt-4 text-sm">
        <Link href="/" className="link">
          ← Back to home
        </Link>
      </p>
    </div>
  )
}
