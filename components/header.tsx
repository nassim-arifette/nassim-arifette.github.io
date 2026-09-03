'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/#projects', label: 'Projects' },
  { href: '/blog', label: 'Notes' },
  { href: '/cv', label: 'CV' },
]

function isActive(pathname: string, href: string) {
  const base = href.split('#')[0]
  if (base === '/') return false
  return pathname === base || pathname.startsWith(`${base}/`)
}

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="no-print mx-auto w-full max-w-2xl px-5 pt-6 sm:pt-8">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          {site.name}
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4 text-sm sm:gap-5">
          {nav.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'transition-colors hover:text-foreground',
                  active ? 'text-foreground underline underline-offset-4' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
