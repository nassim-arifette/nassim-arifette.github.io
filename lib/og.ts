import fs from 'node:fs'
import path from 'node:path'
import { absoluteUrl } from './seo'

const OG_PUBLIC_DIR = path.join(process.cwd(), 'public', 'og')
const DEFAULT_OG_BASENAME = 'default'

export function sanitizeOgSlug(slug: string) {
  return slug ? slug.replace(/[^a-zA-Z0-9-_]/g, '-') : ''
}

function hasOgImage(basename: string) {
  try {
    return fs.existsSync(path.join(OG_PUBLIC_DIR, `${basename}.png`))
  } catch {
    return false
  }
}

export function getOgImageUrl(slug?: string) {
  const sanitized = sanitizeOgSlug(slug ?? '')
  const candidate = sanitized || DEFAULT_OG_BASENAME
  const basename = hasOgImage(candidate) ? candidate : DEFAULT_OG_BASENAME
  return absoluteUrl(`/og/${basename}.png`)
}
