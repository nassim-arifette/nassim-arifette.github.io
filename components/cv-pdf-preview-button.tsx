'use client'

import { Eye } from 'lucide-react'

export function CvPdfPreviewButton({ targetId }: { targetId: string }) {
  const revealPreview = () => {
    const preview = document.getElementById(targetId)
    if (!(preview instanceof HTMLDetailsElement)) return

    preview.open = true
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    preview.closest('section')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    })

    window.requestAnimationFrame(() => {
      preview.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true })
    })
  }

  return (
    <button
      type="button"
      aria-controls={targetId}
      onClick={revealPreview}
      className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm transition-colors hover:border-signal hover:text-signal"
    >
      <Eye size={16} aria-hidden="true" /> View embedded PDF
    </button>
  )
}
