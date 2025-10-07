import * as React from 'react'
import Link from 'next/link'

export const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mt-2 scroll-m-20 text-3xl font-semibold tracking-tight" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-10 scroll-m-20 border-b pb-1 text-2xl font-semibold tracking-tight first:mt-0" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight" {...props} />
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
