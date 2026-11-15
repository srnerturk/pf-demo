/** A language the interface is offered in. */
export type Locale = 'tr' | 'en'

export const SUPPORTED_LOCALES: readonly Locale[] = ['tr', 'en']

export const DEFAULT_LOCALE: Locale = 'tr'

export function isLocale(value: unknown): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

/**
 * A person's own choice wins; until they make one, the first browser language
 * we support decides (region ignored, so `en-GB` means `en`); otherwise Turkish.
 */
export function initialLocale({
  remembered,
  preferredLanguages,
}: {
  remembered: Locale | null
  preferredLanguages: readonly string[]
}): Locale {
  if (remembered) return remembered
  const supported = preferredLanguages.map((tag) => tag.split('-')[0].toLowerCase()).find(isLocale)
  return supported ?? DEFAULT_LOCALE
}
