"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { CommandPalette } from '@/components/command-palette'

const nav = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/tags', label: 'Tags' },
  { href: '/cv', label: 'CV' },
  { href: '/other', label: 'Other' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-14 flex items-center justify-between">
        <Link href="/" className="font-medium">Nassim Arifette</Link>
        <nav className="flex items-center gap-6 text-sm">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
              >
                {item.label}
              </Link>
            )
          })}
          <CommandPalette navItems={nav} />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
