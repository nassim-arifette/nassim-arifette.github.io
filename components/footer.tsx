export default function Footer() {
  return (
    <footer className="no-print border-t">
      <div className="container flex flex-col gap-2 py-6 text-center text-sm text-muted-foreground sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>© {new Date().getFullYear()} Nassim Arifette</p>
        <p>Built with Next.js • Tailwind</p>
      </div>
    </footer>
  )
}
