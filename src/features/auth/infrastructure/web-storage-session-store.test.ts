import { beforeEach, describe, expect, it } from 'vitest'
import { WebStorageSessionStore } from './web-storage-session-store'

const session = { email: 'ada@example.com', accessToken: 'header.payload.signature' }

describe('WebStorageSessionStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('has no session before one is saved', () => {
    expect(new WebStorageSessionStore(window.localStorage).load()).toBeNull()
  })

  it('keeps a saved session for the next visit', () => {
    new WebStorageSessionStore(window.localStorage).save(session)

    expect(new WebStorageSessionStore(window.localStorage).load()).toEqual(session)
  })

  it('forgets the session once cleared', () => {
    const store = new WebStorageSessionStore(window.localStorage)
    store.save(session)

    store.clear()

    expect(store.load()).toBeNull()
  })

  it.each([
    ['not JSON', '{'],
    ['not a session', '{"name":"ada"}'],
    ['a session from before access tokens', '{"email":"ada@example.com"}'],
    ['null', 'null'],
  ])('ignores stored data that is %s', (_, stored) => {
    window.localStorage.setItem(WebStorageSessionStore.storageKey, stored)

    expect(new WebStorageSessionStore(window.localStorage).load()).toBeNull()
  })
})
