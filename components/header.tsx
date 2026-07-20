"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { CommandPalette } from '@/components/command-palette'

const nav = [
  { href: '/', label: 'Home' },
  { href: '/cv', label: 'CV' },
  { href: '/projects', label: 'Projects' },
  { href: '/hackathons', label: 'Hackathons' },
  { href: '/blog', label: 'Blog' },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileOpen])

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.12em]"><span className="inline-flex h-7 w-7 items-center justify-center bg-foreground text-[10px] text-background">NA</span><span className="hidden sm:inline">Nassim Arifette</span></Link>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'border-b border-[hsl(var(--signal))] pb-1 text-foreground' : 'pb-1 text-muted-foreground transition hover:text-foreground'}
                >
                  {item.label}
                </Link>
              )
            })}
            <CommandPalette navItems={nav} />
            <ThemeToggle />
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:border-foreground/40"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen ? (
        <div id="mobile-nav" className="border-t border-border/70 bg-background/95 md:hidden">
          <nav className="container flex flex-col gap-3 py-4 text-sm">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
