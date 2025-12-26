type TaggableItem = {
  slug: string
  title: string
  date: string
  tags?: string[]
}

function normalizeTags(tags?: string[]) {
  return (tags ?? []).map((tag) => tag.trim()).filter(Boolean)
}

export function getRelatedByTags<T extends TaggableItem>(
  current: T,
  items: readonly T[],
  limit = 3,
) {
  const currentTags = new Set(normalizeTags(current.tags))
  if (currentTags.size === 0) return []

  return items
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => {
      const candidateTags = new Set(normalizeTags(candidate.tags))
      let overlap = 0
      for (const tag of candidateTags) {
        if (currentTags.has(tag)) {
          overlap += 1
        }
      }
      return { candidate, overlap }
    })
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap
      const dateDiff = +new Date(b.candidate.date) - +new Date(a.candidate.date)
      if (dateDiff !== 0) return dateDiff
      return a.candidate.title.localeCompare(b.candidate.title)
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate)
}
