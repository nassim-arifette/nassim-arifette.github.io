import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-20 text-center space-y-4">
      <h1 className="text-2xl font-semibold">404 — Not found</h1>
      <p className="text-muted-foreground">The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="underline underline-offset-4">
        Go home
      </Link>
    </div>
  )
}
