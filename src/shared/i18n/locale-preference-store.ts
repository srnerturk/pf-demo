import type { Locale } from './locale'

/** Port: remembers the language a person chose between visits. */
export interface LocalePreferenceStore {
  load(): Locale | null
  save(locale: Locale): void
}
