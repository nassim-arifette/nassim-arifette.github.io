'use client'

import { useEffect } from 'react'

interface SeriesProgressRecorderProps {
  seriesSlug: string
  partSlug: string
}

export function SeriesProgressRecorder({ seriesSlug, partSlug }: SeriesProgressRecorderProps) {
  useEffect(() => {
    const key = `series-progress:${seriesSlug}`
    const payload = JSON.stringify({ slug: partSlug, viewedAt: Date.now() })
    try {
      window.localStorage.setItem(key, payload)
    } catch {
      // Swallow storage errors silently (e.g., Safari private mode)
    }
  }, [seriesSlug, partSlug])

  return null
}
