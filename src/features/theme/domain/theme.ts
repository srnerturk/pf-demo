/** How the interface is coloured. */
export type Theme = 'light' | 'dark'

const themes: readonly Theme[] = ['light', 'dark']

export function isTheme(value: unknown): value is Theme {
  return themes.includes(value as Theme)
}

export function otherTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark'
}

/** A person's own choice wins; until they make one, the operating system decides. */
export function initialTheme({ remembered, systemPrefersDark }: { remembered: Theme | null; systemPrefersDark: boolean }): Theme {
  return remembered ?? (systemPrefersDark ? 'dark' : 'light')
}
