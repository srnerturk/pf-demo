import { describe, expect, it } from 'vitest'
import { initialTheme, isTheme, otherTheme } from './theme'

describe('initialTheme', () => {
  it('uses the theme the person chose before', () => {
    expect(initialTheme({ remembered: 'light', systemPrefersDark: true })).toBe('light')
    expect(initialTheme({ remembered: 'dark', systemPrefersDark: false })).toBe('dark')
  })

  it('follows the system preference until the person chooses', () => {
    expect(initialTheme({ remembered: null, systemPrefersDark: true })).toBe('dark')
    expect(initialTheme({ remembered: null, systemPrefersDark: false })).toBe('light')
  })
})

describe('otherTheme', () => {
  it('switches between light and dark', () => {
    expect(otherTheme('light')).toBe('dark')
    expect(otherTheme('dark')).toBe('light')
  })
})

describe('isTheme', () => {
  it.each([
    ['light', true],
    ['dark', true],
    ['system', false],
    [null, false],
  ])('recognises %s as a theme: %s', (value, expected) => {
    expect(isTheme(value)).toBe(expected)
  })
})
