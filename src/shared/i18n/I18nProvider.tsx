import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { catalogs } from './catalog'
import { I18nContext, type I18nContextValue } from './i18n-context'
import { initialLocale, type Locale } from './locale'
import type { LocalePreferenceStore } from './locale-preference-store'
import { translate } from './translate'

interface I18nProviderProps {
  store: LocalePreferenceStore
  /** The browser's languages, most preferred first; used until the person chooses. */
  preferredLanguages: readonly string[]
  children: ReactNode
}

/** Holds the interface language, remembers the person's choice, and keeps `<html lang>` in step. */
export function I18nProvider({ store, preferredLanguages, children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale({ remembered: store.load(), preferredLanguages }))

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(() => {
    const dateTimeFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })
    return {
      locale,
      setLocale(next) {
        store.save(next)
        setLocaleState(next)
      },
      t: (key, params) => translate(catalogs[locale], locale, key, params),
      formatDateTime: (date) => dateTimeFormat.format(date),
    }
  }, [locale, store])

  return <I18nContext value={value}>{children}</I18nContext>
}
