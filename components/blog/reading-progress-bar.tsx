"use client"

import { useEffect, useState } from 'react'

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let animationFrame: number | null = null

    const updateProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const totalScrollable = Math.max(scrollHeight - clientHeight, 1)
      const nextProgress = Math.min(100, Math.max(0, (scrollTop / totalScrollable) * 100))
      setProgress(Number(nextProgress.toFixed(2)))
      animationFrame = null
    }

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateProgress)
      }
    }

    updateProgress()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-border/60">
      <div
        aria-hidden
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
