import { site } from '@/lib/site'

export default function Footer() {
  return (
    <footer className="no-print mx-auto w-full max-w-2xl px-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <nav aria-label="Footer" className="flex gap-4">
          <a href={site.github} target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
          <a href={site.linkedin} target="_blank" rel="noreferrer" className="hover:text-foreground">LinkedIn</a>
          <a href={`mailto:${site.email}`} className="hover:text-foreground">Email</a>
          <a href="/feed.xml" className="hover:text-foreground">RSS</a>
        </nav>
      </div>
    </footer>
  )
}
