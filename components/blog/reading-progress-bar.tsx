"use client"

import { useEffect, useState } from 'react'

export function ReadingProgressBar({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let animationFrame: number | null = null
    const target = document.getElementById(targetId)

    const updateProgress = () => {
      if (!target) {
        animationFrame = null
        return
      }

      const scrollTop = window.scrollY
      const targetTop = target.getBoundingClientRect().top + scrollTop
      const totalScrollable = Math.max(target.scrollHeight - window.innerHeight, 1)
      const nextProgress = Math.min(
        100,
        Math.max(0, ((scrollTop - targetTop) / totalScrollable) * 100),
      )
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
    let resizeObserver: ResizeObserver | null = null
    if (target && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(requestUpdate)
      resizeObserver.observe(target)
    }

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      resizeObserver?.disconnect()
    }
  }, [targetId])

  return (
    <div className="no-print pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-border/60">
      <div
        aria-hidden
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
