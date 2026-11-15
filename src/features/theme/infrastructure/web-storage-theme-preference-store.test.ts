import { beforeEach, describe, expect, it } from 'vitest'
import { WebStorageThemePreferenceStore } from './web-storage-theme-preference-store'

describe('WebStorageThemePreferenceStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('has no preference before one is saved', () => {
    expect(new WebStorageThemePreferenceStore(window.localStorage).load()).toBeNull()
  })

  it('keeps a saved theme for the next visit', () => {
    new WebStorageThemePreferenceStore(window.localStorage).save('dark')

    expect(new WebStorageThemePreferenceStore(window.localStorage).load()).toBe('dark')
  })

  it('ignores stored data that is not a theme', () => {
    window.localStorage.setItem(WebStorageThemePreferenceStore.storageKey, 'sepia')

    expect(new WebStorageThemePreferenceStore(window.localStorage).load()).toBeNull()
  })
})
