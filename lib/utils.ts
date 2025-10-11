export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function slugifyTag(tag: string) {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function matchTagFromSlug(slug: string, candidates: string[]) {
  const normalized = slug.toLowerCase()
  for (const tag of candidates) {
    if (slugifyTag(tag) === normalized) {
      return tag
    }
  }
  return undefined
}
