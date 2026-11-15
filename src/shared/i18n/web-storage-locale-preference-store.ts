import { isLocale, type Locale } from './locale'
import type { LocalePreferenceStore } from './locale-preference-store'

/** Keeps the chosen language in browser Web Storage. */
export class WebStorageLocalePreferenceStore implements LocalePreferenceStore {
  static readonly storageKey = 'pf-demo.locale'

  private readonly storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  load(): Locale | null {
    const stored = this.storage.getItem(WebStorageLocalePreferenceStore.storageKey)
    return isLocale(stored) ? stored : null
  }

  save(locale: Locale): void {
    this.storage.setItem(WebStorageLocalePreferenceStore.storageKey, locale)
  }
}
