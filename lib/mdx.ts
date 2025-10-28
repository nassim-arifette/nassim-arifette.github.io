export function formatDate(input: string, locale = 'en-US') {
  const date = new Date(input)
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

export function countWords(raw?: string | null) {
  if (!raw) return 0
  const matches = raw.match(/\S+/g)
  return matches ? matches.length : 0
}

export function estimateReadingTimeMinutes(raw?: string | null, wordsPerMinute = 200) {
  const totalWords = countWords(raw)
  if (totalWords === 0) return undefined
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute))
}

export function getReadingStats(raw?: string | null, wordsPerMinute = 200) {
  const totalWords = countWords(raw)
  const minutes = totalWords === 0 ? undefined : Math.max(1, Math.ceil(totalWords / wordsPerMinute))
  return { words: totalWords, minutes }
}

