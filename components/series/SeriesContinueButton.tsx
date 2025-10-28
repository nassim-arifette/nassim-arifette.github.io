'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface SeriesContinueButtonProps {
  seriesSlug: string
  parts: Array<{
    slug: string
    title: string
    index: number
    url: string
  }>
}

export function SeriesContinueButton({ seriesSlug, parts }: SeriesContinueButtonProps) {
  const [resumeSlug, setResumeSlug] = useState<string | null>(null)

  useEffect(() => {
    const key = `series-progress:${seriesSlug}`
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.slug === 'string') {
        setResumeSlug(parsed.slug)
      }
    } catch {
      // Ignore JSON/storage errors silently
    }
  }, [seriesSlug])

  if (!resumeSlug) return null

  const resumePart = parts.find((part) => part.slug === resumeSlug)
  if (!resumePart || resumePart.index <= 0) return null

  return (
    <Link
      href={resumePart.url}
      className="inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-foreground/50 hover:text-foreground"
      aria-label={`Continue from Part ${resumePart.index + 1}: ${resumePart.title}`}
    >
      Continue Part {resumePart.index + 1}
      <ChevronRight className="size-4" aria-hidden="true" />
    </Link>
  )
}
