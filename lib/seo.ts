// Fallback to the live GitHub Pages host so canonicals remain stable if env vars are missing.
const DEFAULT_SITE_URL = 'https://nassim-arifette.github.io'

export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL
  if (!envUrl) return DEFAULT_SITE_URL
  return envUrl.replace(/\/$/, '')
}

export function absoluteUrl(path = '/') {
  const base = getSiteUrl()
  if (!path.startsWith('/')) return `${base}/${path}`
  return `${base}${path}`
}

