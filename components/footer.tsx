export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container h-16 flex items-center justify-between text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Rayane</p>
        <p>Built with Next.js • Tailwind</p>
      </div>
    </footer>
  )
}

