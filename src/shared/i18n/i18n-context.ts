import { createContext } from 'react'
import type { MessageKey } from './catalog'
import type { Locale } from './locale'
import type { MessageParams } from './translate'

export interface I18nContextValue {
  locale: Locale
  setLocale(locale: Locale): void
  /** The message for `key` in the current language, with `{name}` placeholders filled from `params`. */
  t(key: MessageKey, params?: MessageParams): string
  /** A date and time written the way the current language writes them. */
  formatDateTime(date: Date): string
}

export const I18nContext = createContext<I18nContextValue | null>(null)
