"use client"

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type ZoomableImageProps = React.ComponentPropsWithoutRef<'img'>

export function ZoomableImage({
  className = '',
  onClick,
  onKeyDown,
  alt = '',
  ...rest
}: ZoomableImageProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hasMounted, setHasMounted] = React.useState(false)

  const imageRef = React.useRef<HTMLImageElement | null>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  const openLightbox = React.useCallback(() => {
    if (typeof document !== 'undefined') {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    }
    setIsOpen(true)
  }, [])

  const closeLightbox = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeLightbox()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const focusTimeout = window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 0)

    return () => {
      window.clearTimeout(focusTimeout)
      window.removeEventListener('keydown', handleKeyDown)
      body.style.overflow = previousOverflow
      if (imageRef.current) {
        imageRef.current.focus()
      } else {
        previouslyFocusedRef.current?.focus()
      }
    }
  }, [isOpen, closeLightbox])

  const handlePreviewClick = React.useCallback(
    (event: React.MouseEvent<HTMLImageElement>) => {
      onClick?.(event)
      if (event.defaultPrevented) return
      event.stopPropagation()
      openLightbox()
    },
    [onClick, openLightbox],
  )

  const handlePreviewKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLImageElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented) return

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openLightbox()
      }
    },
    [onKeyDown, openLightbox],
  )

  const handleOverlayClick = React.useCallback(() => {
    closeLightbox()
  }, [closeLightbox])

  const handleContentClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }, [])

  const previewProps = React.useMemo(() => {
    const props: ZoomableImageProps = { ...rest }
    if (!props.loading) {
      props.loading = 'lazy'
    }
    return props
  }, [rest])

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt ? `Expanded view of ${alt}` : 'Expanded image'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="relative max-h-[90vh] w-full max-w-4xl" onClick={handleContentClick}>
        <button
          ref={closeButtonRef}
          type="button"
          className="absolute right-4 top-4 rounded-full border border-transparent bg-background/80 px-3 py-1 text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={closeLightbox}
        >
          Close
        </button>
        <img
          {...rest}
          alt={alt}
          className="max-h-[80vh] w-full rounded-lg object-contain shadow-xl"
        />
      </div>
    </div>
  )

  return (
    <>
      <img
        {...previewProps}
        ref={imageRef}
        alt={alt}
        role="button"
        tabIndex={0}
        onClick={handlePreviewClick}
        onKeyDown={handlePreviewKeyDown}
        className={cn(
          'cursor-zoom-in rounded-lg border border-border/50 transition duration-200 ease-out hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        )}
      />
      {hasMounted && isOpen ? createPortal(overlay, document.body) : null}
    </>
  )
}

