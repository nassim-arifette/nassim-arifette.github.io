"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu, Search, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { CommandPalette } from '@/components/command-palette'
import type { CommandSearchEntry } from '@/lib/content-projections'

const nav = [
  { href: '/#research', label: 'Research' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Notes' },
  { href: '/cv', label: 'About' },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/#research') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Header({ commandEntries }: { commandEntries: CommandSearchEntry[] }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMobileOpen(false)
        requestAnimationFrame(() => menuButtonRef.current?.focus())
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileOpen])

  const openSearch = () => {
    setMobileOpen(false)
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      }),
    )
  }

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-border/80 bg-background">
      <div className="container flex min-h-[4.75rem] items-center justify-between gap-6 py-3">
        <Link href="/" className="group min-w-0 leading-none" aria-label="Nassim Arifette, home">
          <span className="block truncate font-serif text-xl tracking-[-0.02em] text-foreground transition-colors group-hover:text-signal">
            Nassim Arifette
          </span>
          <span className="mt-1.5 block truncate text-[0.68rem] uppercase tracking-[0.13em] text-muted-foreground sm:hidden">
            ML research &amp; engineering
          </span>
          <span className="mt-1.5 hidden truncate text-xs tracking-[0.04em] text-muted-foreground sm:block">
            Machine learning research &amp; engineering
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <nav aria-label="Primary navigation" className="hidden items-center gap-6 lg:flex">
            {nav.map((item) => {
              const active = isActivePath(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'inline-flex min-h-10 items-center border-b border-foreground text-sm text-foreground [@media(pointer:coarse)]:min-h-12'
                      : 'inline-flex min-h-10 items-center border-b border-transparent text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground [@media(pointer:coarse)]:min-h-12'
                  }
                >
                  {item.label}
                </Link>
              )
            })}

            <span className="h-5 w-px bg-border" aria-hidden="true" />
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noreferrer"
              aria-label="Open CV PDF in a new tab"
              className="inline-flex min-h-10 items-center gap-1 border-b border-transparent text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground [@media(pointer:coarse)]:min-h-12"
            >
              CV <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </nav>

          <CommandPalette navItems={nav} contentEntries={commandEntries} />
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>

          <div className="flex items-center border-l border-border/80 lg:hidden">
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [@media(pointer:coarse)]:h-12 [@media(pointer:coarse)]:w-12"
              aria-label="Search the site"
              title="Search"
            >
              <Search size={17} aria-hidden="true" />
            </button>
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [@media(pointer:coarse)]:h-12 [@media(pointer:coarse)]:w-12"
              onClick={() => setMobileOpen((previous) => !previous)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div id="mobile-nav" className="border-t border-border/80 bg-background lg:hidden">
          <nav aria-label="Mobile navigation" className="container divide-y divide-border/70 py-2">
            {nav.map((item, index) => {
              const active = isActivePath(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className="grid min-h-12 grid-cols-[2rem_1fr_auto] items-center gap-3 py-3 text-sm"
                >
                  <span className="font-mono text-[0.65rem] tabular-nums text-muted-foreground" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={active ? 'font-medium text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                  {active ? <span className="h-1.5 w-1.5 bg-signal" aria-hidden="true" /> : null}
                </Link>
              )
            })}
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noreferrer"
              aria-label="Open CV PDF in a new tab"
              onClick={() => setMobileOpen(false)}
              className="grid min-h-12 grid-cols-[2rem_1fr_auto] items-center gap-3 py-3 text-sm text-muted-foreground"
            >
              <span className="font-mono text-[0.65rem] tabular-nums" aria-hidden="true">05</span>
              <span>CV (PDF)</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
