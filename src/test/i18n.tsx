import type { ReactNode } from 'react'
import { I18nProvider } from '@/shared/i18n/I18nProvider'
import type { Locale } from '@/shared/i18n/locale'
import type { LocalePreferenceStore } from '@/shared/i18n/locale-preference-store'

/** Wraps components under test in the given language (Turkish unless told otherwise), remembering nothing. */
export function TestI18nProvider({ locale = 'tr', children }: { locale?: Locale; children: ReactNode }) {
  const store: LocalePreferenceStore = { load: () => locale, save: () => {} }
  return (
    <I18nProvider store={store} preferredLanguages={[]}>
      {children}
    </I18nProvider>
  )
}
