export default function Footer() {
  return (
    <footer className="no-print border-t border-border/70">
      <div className="container flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Nassim Arifette</p>
        <div className="flex gap-5">
          <a href="https://github.com/nassim-arifette" target="_blank" rel="noreferrer" className="transition hover:text-foreground">GitHub</a>
          <a href="https://www.linkedin.com/in/nassim-arifette" target="_blank" rel="noreferrer" className="transition hover:text-foreground">LinkedIn</a>
          <a href="/cv" className="transition hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  )
}
