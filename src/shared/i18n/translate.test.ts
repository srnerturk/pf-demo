import { describe, expect, it } from 'vitest'
import { translate } from './translate'

const catalog = {
  greeting: 'Hello',
  users: {
    total: 'Found {count} records in {area}',
    selected: { one: '{count} user selected', other: '{count} users selected' },
  },
}

describe('translate', () => {
  it('looks a message up by its dotted key', () => {
    expect(translate(catalog, 'en', 'greeting')).toBe('Hello')
  })

  it('fills in named parameters', () => {
    expect(translate(catalog, 'en', 'users.total', { count: 119, area: 'Users' })).toBe('Found 119 records in Users')
  })

  it('leaves a placeholder visible when its parameter is missing', () => {
    expect(translate(catalog, 'en', 'users.total', { count: 3 })).toBe('Found 3 records in {area}')
  })

  it('picks the plural form the language uses for the count', () => {
    expect(translate(catalog, 'en', 'users.selected', { count: 1 })).toBe('1 user selected')
    expect(translate(catalog, 'en', 'users.selected', { count: 4 })).toBe('4 users selected')
  })

  it('shows the key itself when a message is missing, so the gap is visible', () => {
    expect(translate(catalog, 'en', 'users.nope')).toBe('users.nope')
    expect(translate(catalog, 'en', 'users')).toBe('users')
  })
})
