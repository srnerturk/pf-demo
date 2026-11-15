import { describe, expect, it } from 'vitest'
import { initialLocale, isLocale } from './locale'

describe('isLocale', () => {
  it('accepts the supported languages only', () => {
    expect(isLocale('tr')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('de')).toBe(false)
    expect(isLocale(null)).toBe(false)
  })
})

describe('initialLocale', () => {
  it('uses the language the person chose before', () => {
    expect(initialLocale({ remembered: 'en', preferredLanguages: ['tr-TR'] })).toBe('en')
  })

  it('otherwise follows the first supported browser language, ignoring the region', () => {
    expect(initialLocale({ remembered: null, preferredLanguages: ['de-DE', 'en-GB', 'tr'] })).toBe('en')
  })

  it('falls back to Turkish', () => {
    expect(initialLocale({ remembered: null, preferredLanguages: ['de-DE'] })).toBe('tr')
    expect(initialLocale({ remembered: null, preferredLanguages: [] })).toBe('tr')
  })
})
