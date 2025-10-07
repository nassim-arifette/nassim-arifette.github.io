const PREVIEW_MAX_LENGTH = 240

function stripMarkdown(source: string) {
  return source
    .replace(/^---[\s\S]*?---/, '') // frontmatter
    .replace(/```[\s\S]*?```/g, '') // code fences
    .replace(/`[^`]*`/g, '') // inline code
    .replace(/!\[[^\]]*]\([^)]+\)/g, '') // images
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1') // links
    .replace(/[#>*_~\-]+/g, ' ')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getPreviewText(raw?: string, fallback?: string, maxLength = PREVIEW_MAX_LENGTH) {
  const source = raw?.trim() || fallback?.trim() || ''
  if (!source) return ''

  const cleaned = stripMarkdown(source)
  if (!cleaned) return fallback?.trim() || ''

  if (cleaned.length <= maxLength) {
    return cleaned
  }

  return `${cleaned.slice(0, maxLength).trimEnd()}...`
}

