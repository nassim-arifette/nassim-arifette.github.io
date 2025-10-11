import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
  it('shows the sun icon when the current theme is dark and toggles to light on click', async () => {
    const setTheme = vi.fn()
    const { container } = renderWithTheme({ resolvedTheme: 'dark', setTheme })
    const button = screen.getByRole('button', { name: /toggle theme/i })

    await waitFor(() => expect(container.querySelector('svg.lucide-sun')).toBeInTheDocument())

    fireEvent.click(button)

    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('toggles from light to dark on click', async () => {
    const setTheme = vi.fn()
    renderWithTheme({ resolvedTheme: 'light', setTheme })
    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
