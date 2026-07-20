export function isProjectLinkReady(href: unknown): href is string {
  return typeof href === 'string' && href.length > 0 && !href.includes('...') && !href.includes('github.com/you/')
}
