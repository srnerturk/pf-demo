import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TestI18nProvider } from '@/test/i18n'
import type { ThemePreferenceStore } from '../application/theme-preference-store'
import type { Theme } from '../domain/theme'
import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from './useTheme'

class FakeThemePreferenceStore implements ThemePreferenceStore {
  stored: Theme | null

  constructor(stored: Theme | null = null) {
    this.stored = stored
  }

  load() {
    return this.stored
  }

  save(theme: Theme) {
    this.stored = theme
  }
}

function renderToggle({ store = new FakeThemePreferenceStore(), systemPrefersDark = false } = {}) {
  const user = userEvent.setup()
  render(
    <TestI18nProvider>
      <ThemeProvider store={store} systemPrefersDark={systemPrefersDark}>
        <ThemeToggle />
      </ThemeProvider>
    </TestI18nProvider>,
  )
  return { user, store }
}

const root = () => document.documentElement

describe('ThemeToggle', () => {
  afterEach(() => {
    root().classList.remove('dark')
  })

  it('starts in the theme the person chose before', () => {
    renderToggle({ store: new FakeThemePreferenceStore('dark') })

    expect(root()).toHaveClass('dark')
    expect(screen.getByRole('button', { name: 'Açık temaya geç' })).toBeInTheDocument()
  })

  it('follows the system preference until the person chooses', () => {
    renderToggle({ systemPrefersDark: true })

    expect(root()).toHaveClass('dark')
  })

  it('switches to dark and back, remembering each choice', async () => {
    const { user, store } = renderToggle()
    expect(root()).not.toHaveClass('dark')

    await user.click(screen.getByRole('button', { name: 'Koyu temaya geç' }))
    expect(root()).toHaveClass('dark')
    expect(store.stored).toBe('dark')

    await user.click(screen.getByRole('button', { name: 'Açık temaya geç' }))
    expect(root()).not.toHaveClass('dark')
    expect(store.stored).toBe('light')
  })
})

describe('useTheme', () => {
  it('explains that it needs a ThemeProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Probe() {
      useTheme()
      return null
    }

    expect(() => render(<Probe />)).toThrow('useTheme must be used inside a ThemeProvider')
  })
})
