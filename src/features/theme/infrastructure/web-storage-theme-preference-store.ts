import type { ThemePreferenceStore } from '../application/theme-preference-store'
import { isTheme, type Theme } from '../domain/theme'

/** Keeps the chosen theme in browser Web Storage. index.html reads the same key to avoid a flash on load. */
export class WebStorageThemePreferenceStore implements ThemePreferenceStore {
  static readonly storageKey = 'pf-demo.theme'

  private readonly storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  load(): Theme | null {
    const stored = this.storage.getItem(WebStorageThemePreferenceStore.storageKey)
    return isTheme(stored) ? stored : null
  }

  save(theme: Theme): void {
    this.storage.setItem(WebStorageThemePreferenceStore.storageKey, theme)
  }
}
