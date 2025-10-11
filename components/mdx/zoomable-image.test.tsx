import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ZoomableImage } from './zoomable-image'

afterEach(() => {
  document.body.style.overflow = ''
})

describe('ZoomableImage', () => {
  it('opens the lightbox when the preview image is clicked', async () => {
    render(<ZoomableImage src="/test-image.jpg" alt="Test image" />)
    const trigger = screen.getByRole('button', { name: /test image/i })

    fireEvent.click(trigger)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('closes the lightbox when the close button is pressed', async () => {
    render(<ZoomableImage src="/test-image.jpg" alt="Test image" />)
    fireEvent.click(screen.getByRole('button', { name: /test image/i }))

    const closeButton = await screen.findByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes the lightbox when Escape is pressed', async () => {
    render(<ZoomableImage src="/test-image.jpg" alt="Test image" />)
    fireEvent.click(screen.getByRole('button', { name: /test image/i }))
    await screen.findByRole('dialog')

    fireEvent.keyDown(window, { key: 'Escape' })

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})

