import { beforeEach, describe, expect, it } from 'vitest'
import { WebStorageLocalePreferenceStore } from './web-storage-locale-preference-store'

describe('WebStorageLocalePreferenceStore', () => {
  beforeEach(() => window.localStorage.clear())

  it('remembers nothing until a language is saved', () => {
    expect(new WebStorageLocalePreferenceStore(window.localStorage).load()).toBeNull()
  })

  it('remembers the saved language between visits', () => {
    new WebStorageLocalePreferenceStore(window.localStorage).save('en')

    expect(new WebStorageLocalePreferenceStore(window.localStorage).load()).toBe('en')
  })

  it('ignores a stored value that is not a supported language', () => {
    window.localStorage.setItem(WebStorageLocalePreferenceStore.storageKey, 'klingon')

    expect(new WebStorageLocalePreferenceStore(window.localStorage).load()).toBeNull()
  })
})
