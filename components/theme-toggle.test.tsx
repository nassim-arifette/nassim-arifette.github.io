import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot } from 'react-dom/client'
import { useTheme } from 'next-themes'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ThemeToggle } from './theme-toggle'

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}))

const mockedUseTheme = vi.mocked(useTheme)

type MockedThemeContext = {
  resolvedTheme?: string
  setTheme: (value: string) => void
}

const renderWithTheme = (context: MockedThemeContext) => {
  mockedUseTheme.mockReturnValue(context as ReturnType<typeof useTheme>)
  return render(<ThemeToggle />)
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('ThemeToggle', () => {
  it('hydrates without mismatched markup when the saved theme is dark', async () => {
    const setTheme = vi.fn()
    mockedUseTheme.mockReturnValue({ setTheme } as ReturnType<typeof useTheme>)
    const container = document.createElement('div')
    container.innerHTML = renderToString(<ThemeToggle />)
    document.body.appendChild(container)
    mockedUseTheme.mockReturnValue({ resolvedTheme: 'dark', setTheme } as ReturnType<typeof useTheme>)
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    let root: ReturnType<typeof hydrateRoot> | undefined

    try {
      await act(async () => {
        root = hydrateRoot(container, <ThemeToggle />)
      })
      expect(container.querySelector('button')).toHaveAttribute('aria-label', 'Switch to light theme')
      expect(errors.mock.calls.map((call) => call.join(' ')).join('\n')).not.toMatch(/did not match|hydration|server HTML/i)
    } finally {
      await act(async () => root?.unmount())
      container.remove()
      errors.mockRestore()
    }
  })

  it('shows the sun icon when the current theme is dark and toggles to light on click', async () => {
    const setTheme = vi.fn()
    const { container } = renderWithTheme({ resolvedTheme: 'dark', setTheme })
    const button = screen.getByRole('button', { name: /switch to light theme/i })

    await waitFor(() => expect(container.querySelector('svg.lucide-sun')).toBeInTheDocument())

    fireEvent.click(button)

    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('toggles from light to dark on click', async () => {
    const setTheme = vi.fn()
    renderWithTheme({ resolvedTheme: 'light', setTheme })
    const button = screen.getByRole('button', { name: /switch to dark theme/i })
    fireEvent.click(button)

    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
