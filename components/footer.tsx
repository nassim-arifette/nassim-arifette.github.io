export default function Footer() {
  return (
    <footer className="no-print border-t border-border/80">
      <div className="container grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="font-serif text-lg tracking-[-0.015em] text-foreground">Nassim Arifette</p>
          <p className="mt-1 text-xs tracking-[0.04em] text-muted-foreground">
            Machine learning research &amp; engineering
          </p>
          <p className="mt-5 text-xs tabular-nums text-muted-foreground">
            © {new Date().getFullYear()} Nassim Arifette
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground sm:justify-end">
          <a
            href="https://github.com/nassim-arifette"
            target="_blank"
            rel="noreferrer"
            className="border-b border-transparent pb-0.5 transition-colors hover:border-border hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/nassim-arifette"
            target="_blank"
            rel="noreferrer"
            className="border-b border-transparent pb-0.5 transition-colors hover:border-border hover:text-foreground"
          >
            LinkedIn
          </a>
          <a
            href="mailto:nassim.ari@gmail.com"
            className="border-b border-transparent pb-0.5 transition-colors hover:border-border hover:text-foreground"
          >
            Email
          </a>
          <a
            href="/cv.pdf"
            target="_blank"
            rel="noreferrer"
            className="border-b border-transparent pb-0.5 transition-colors hover:border-border hover:text-foreground"
          >
            CV (PDF)
          </a>
        </nav>
      </div>
    </footer>
  )
}
