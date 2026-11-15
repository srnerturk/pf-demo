<<<<<<< HEAD
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SessionStore } from '../application/session-store'
import type { Session } from '../domain/authentication'
=======
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionStore } from '../application/session-store'
import type { Session } from '../domain/authentication'
import { aSession } from '../testing/session-fixtures'
>>>>>>> development
import { SessionProvider } from './SessionProvider'
import { useSession } from './useSession'

class FakeSessionStore implements SessionStore {
  stored: Session | null

  constructor(stored: Session | null = null) {
    this.stored = stored
  }

  load() {
    return this.stored
  }

  save(session: Session) {
    this.stored = session
  }

  clear() {
    this.stored = null
  }
}

<<<<<<< HEAD
function SessionProbe() {
  const { session, startSession, endSession } = useSession()
  return (
    <>
      <p>{session ? `Signed in as ${session.email}` : 'Signed out'}</p>
      <button type="button" onClick={() => startSession({ email: 'ada@example.com', accessToken: 'token' })}>
=======
const NOW = Date.UTC(2026, 10, 15, 12, 0, 0)
const HOUR = 60 * 60 * 1000
const session = aSession({ expiresAt: NOW + HOUR })

function SessionProbe() {
  const { session: current, startSession, endSession } = useSession()
  return (
    <>
      <p>{current ? `Signed in as ${current.user.email}` : 'Signed out'}</p>
      <button type="button" onClick={() => startSession(session)}>
>>>>>>> development
        Start
      </button>
      <button type="button" onClick={endSession}>
        End
      </button>
    </>
  )
}

<<<<<<< HEAD
function renderWithStore(store: SessionStore) {
  const user = userEvent.setup()
  render(
    <SessionProvider store={store}>
=======
function renderWithStore(store: SessionStore, now: () => number = () => NOW) {
  const user = userEvent.setup()
  render(
    <SessionProvider store={store} now={now}>
>>>>>>> development
      <SessionProbe />
    </SessionProvider>,
  )
  return { user }
}

describe('SessionProvider', () => {
<<<<<<< HEAD
  it('restores the session remembered by the store', () => {
    renderWithStore(new FakeSessionStore({ email: 'ada@example.com', accessToken: 'token' }))
=======
  afterEach(() => {
    vi.useRealTimers()
  })

  it('restores the session remembered by the store', () => {
    renderWithStore(new FakeSessionStore(session))
>>>>>>> development

    expect(screen.getByText('Signed in as ada@example.com')).toBeInTheDocument()
  })

<<<<<<< HEAD
=======
  it('does not restore a session that has expired, and forgets it', () => {
    const store = new FakeSessionStore(aSession({ expiresAt: NOW }))

    renderWithStore(store)

    expect(screen.getByText('Signed out')).toBeInTheDocument()
    expect(store.stored).toBeNull()
  })

>>>>>>> development
  it('starts a session and remembers it', async () => {
    const store = new FakeSessionStore()
    const { user } = renderWithStore(store)
    expect(screen.getByText('Signed out')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByText('Signed in as ada@example.com')).toBeInTheDocument()
<<<<<<< HEAD
    expect(store.stored).toEqual({ email: 'ada@example.com', accessToken: 'token' })
  })

  it('ends the session and forgets it', async () => {
    const store = new FakeSessionStore({ email: 'ada@example.com', accessToken: 'token' })
=======
    expect(store.stored).toEqual(session)
  })

  it('ends the session and forgets it', async () => {
    const store = new FakeSessionStore(session)
>>>>>>> development
    const { user } = renderWithStore(store)

    await user.click(screen.getByRole('button', { name: 'End' }))

    expect(screen.getByText('Signed out')).toBeInTheDocument()
    expect(store.stored).toBeNull()
  })
<<<<<<< HEAD
=======

  it('ends the session when its access expires while the app is open', () => {
    vi.useFakeTimers({ now: NOW })
    const store = new FakeSessionStore(session)
    renderWithStore(store, Date.now)

    act(() => vi.advanceTimersByTime(HOUR - 1))
    expect(screen.getByText('Signed in as ada@example.com')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByText('Signed out')).toBeInTheDocument()
    expect(store.stored).toBeNull()
  })
>>>>>>> development
})

describe('useSession', () => {
  it('explains that it needs a SessionProvider', () => {
    // React logs the thrown render error; silence it to keep the output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<SessionProbe />)).toThrow('useSession must be used inside a SessionProvider')
  })
})
