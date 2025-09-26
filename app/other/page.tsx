export const metadata = {
  title: 'Other',
  description: 'Hobbies and misc.',
}

export default function OtherPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Other</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border p-5 bg-card">
          <h2 className="font-medium">Chess</h2>
          <p className="text-sm text-muted-foreground">I enjoy tactics and rapid games.</p>
        </div>
        <div className="rounded-lg border p-5 bg-card">
          <h2 className="font-medium">Music</h2>
          <p className="text-sm text-muted-foreground">Curating playlists and occasional guitar.</p>
        </div>
      </div>
    </div>
  )
}

