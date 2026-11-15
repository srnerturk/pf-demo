import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ThemePreferenceStore } from '../application/theme-preference-store'
import { initialTheme, otherTheme, type Theme } from '../domain/theme'
import { ThemeContext, type ThemeContextValue } from './theme-context'

interface ThemeProviderProps {
  store: ThemePreferenceStore
  /** Whether the operating system asks for dark mode; used until the person chooses. */
  systemPrefersDark: boolean
  children: ReactNode
}

/** Holds the app's theme, remembers the person's choice, and applies it to the page. */
export function ThemeProvider({ store, systemPrefersDark, children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => initialTheme({ remembered: store.load(), systemPrefersDark }))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme() {
        const next = otherTheme(theme)
        store.save(next)
        setTheme(next)
      },
    }),
    [theme, store],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
