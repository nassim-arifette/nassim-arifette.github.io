export default function Footer() {
  return (
    <footer className="no-print border-t">
      <div className="container h-16 flex items-center justify-between text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Nassim Arifette</p>
        <p>Built with Next.js • Tailwind</p>
      </div>
    </footer>
  )
}
