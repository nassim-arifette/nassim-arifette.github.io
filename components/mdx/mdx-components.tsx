"use client"

import * as React from 'react'
import Link from 'next/link'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

const HeadingAnchor = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ href = '', className = '', children: _children, ...rest }, ref) => {
    const [copyState, setCopyState] = React.useState<'idle' | 'copied'>('idle')

    React.useEffect(() => {
      if (copyState !== 'copied') return
      const timeout = window.setTimeout(() => setCopyState('idle'), 2000)
      return () => window.clearTimeout(timeout)
    }, [copyState])

    const handleClick = React.useCallback(
      async (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        if (!href) return
        const hash = href.startsWith('#') ? href : `#${href}`

        if (typeof window !== 'undefined') {
          const targetUrl = `${window.location.origin}${window.location.pathname}${hash}`
          let didCopy = false

          if (navigator?.clipboard?.writeText) {
            try {
              await navigator.clipboard.writeText(targetUrl)
              didCopy = true
            } catch {
              didCopy = false
            }
          }

          if (!didCopy) {
            try {
              const textarea = document.createElement('textarea')
              textarea.value = targetUrl
              textarea.setAttribute('readonly', '')
              textarea.style.position = 'absolute'
              textarea.style.left = '-9999px'
              document.body.appendChild(textarea)
              textarea.select()
              didCopy = document.execCommand('copy')
              document.body.removeChild(textarea)
            } catch {
              didCopy = false
            }
          }

          setCopyState(didCopy ? 'copied' : 'idle')

          window.history.replaceState(null, '', hash)

          const targetId = hash.slice(1)
          const element = document.getElementById(targetId)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      },
      [href],
    )

    const isCopied = copyState === 'copied'

    return (
      <a
        ref={ref}
        href={href}
        onClick={handleClick}
        data-copy-state={isCopied ? 'copied' : 'idle'}
        aria-label={isCopied ? 'Link copied' : rest['aria-label'] ?? 'Copy link to section'}
        title={rest.title ?? (isCopied ? 'Link copied' : 'Copy link to section')}
        className={cn(
          'ml-2 inline-flex h-6 w-6 items-center justify-center rounded border border-transparent text-sm text-muted-foreground opacity-0 transition hover:border-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 focus-visible:opacity-100',
          isCopied && 'border-muted-foreground text-foreground',
          className,
        )}
        {...rest}
      >
        <span className="sr-only">{isCopied ? 'Link copied' : 'Copy link to section'}</span>
        {isCopied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
      </a>
    )
  },
)
HeadingAnchor.displayName = 'HeadingAnchor'

export const mdxComponents = {
  h1: ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn('group mt-2 scroll-m-20 text-3xl font-semibold tracking-tight', className)} {...props} />
  ),
  h2: ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        'group mt-10 scroll-m-20 border-b pb-1 text-2xl font-semibold tracking-tight first:mt-0',
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('group mt-8 scroll-m-20 text-xl font-semibold tracking-tight', className)} {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-6 ml-6 list-disc" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-6 ml-6 list-decimal" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic text-muted-foreground" {...props} />
  ),
  a: ({
    href = '',
    className = '',
    children,
    rel: _rel,
    target: _target,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      return (
        <HeadingAnchor href={href} className={className} {...rest}>
          {children}
        </HeadingAnchor>
      )
    }

    const linkClassName = className
      ? `font-medium underline underline-offset-4 ${className}`
      : 'font-medium underline underline-offset-4'
    const isExternal =
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    const safeHref = href || '#'

    if (isExternal) {
      return (
        <a href={safeHref} target="_blank" rel="noopener noreferrer" className={linkClassName} {...rest}>
          {children}
        </a>
      )
    }

    return (
      <Link href={safeHref} className={linkClassName} {...rest}>
        {children}
      </Link>
    )
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="my-6 overflow-x-auto rounded-lg border bg-muted p-4" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-muted px-1 py-0.5" {...props} />
  ),
}
