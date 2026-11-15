import { beforeEach, describe, expect, it } from 'vitest'
import { aSession } from '../testing/session-fixtures'
import { RememberMeSessionStore } from './remember-me-session-store'
import { WebStorageSessionStore } from './web-storage-session-store'

const acrossVisits = () => new WebStorageSessionStore(window.localStorage)
const thisVisitOnly = () => new WebStorageSessionStore(window.sessionStorage)
const makeStore = () => new RememberMeSessionStore({ acrossVisits: acrossVisits(), thisVisitOnly: thisVisitOnly() })

describe('RememberMeSessionStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('keeps a remembered session across visits', () => {
    const session = aSession({ remember: true })

    makeStore().save(session)

    expect(acrossVisits().load()).toEqual(session)
    expect(thisVisitOnly().load()).toBeNull()
    expect(makeStore().load()).toEqual(session)
  })

  it('keeps any other session for this visit only', () => {
    const session = aSession({ remember: false })

    makeStore().save(session)

    expect(thisVisitOnly().load()).toEqual(session)
    expect(acrossVisits().load()).toBeNull()
    expect(makeStore().load()).toEqual(session)
  })

  it('forgets a remembered session once a later one is not to be remembered', () => {
    const store = makeStore()
    store.save(aSession({ email: 'ada@example.com', remember: true }))

    store.save(aSession({ email: 'grace@example.com', remember: false }))

    expect(acrossVisits().load()).toBeNull()
    expect(store.load()?.user.email).toBe('grace@example.com')
  })

  it('forgets the session wherever it was kept once cleared', () => {
    const store = makeStore()
    store.save(aSession({ remember: true }))

    store.clear()

    expect(store.load()).toBeNull()
    expect(acrossVisits().load()).toBeNull()
  })
})
