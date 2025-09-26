export function formatDate(input: string, locale = 'en-US') {
  const date = new Date(input)
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

