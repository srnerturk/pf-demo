import type { Theme } from '../domain/theme'

/** Port: remembers the theme a person chose between visits. Implemented in infrastructure. */
export interface ThemePreferenceStore {
  load(): Theme | null
  save(theme: Theme): void
}
