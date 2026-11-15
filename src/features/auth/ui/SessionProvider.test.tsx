import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionStore } from '../application/session-store'
import type { Session } from '../domain/authentication'
import { aSession } from '../testing/session-fixtures'
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

const NOW = Date.UTC(2026, 10, 15, 12, 0, 0)
const HOUR = 60 * 60 * 1000
const session = aSession({ expiresAt: NOW + HOUR })

function SessionProbe() {
  const { session: current, startSession, endSession } = useSession()
  return (
    <>
      <p>{current ? `Signed in as ${current.user.email}` : 'Signed out'}</p>
      <button type="button" onClick={() => startSession(session)}>
        Start
      </button>
      <button type="button" onClick={endSession}>
        End
      </button>
    </>
  )
}

function renderWithStore(store: SessionStore, now: () => number = () => NOW) {
  const user = userEvent.setup()
  render(
    <SessionProvider store={store} now={now}>
      <SessionProbe />
    </SessionProvider>,
  )
  return { user }
}

describe('SessionProvider', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('restores the session remembered by the store', () => {
    renderWithStore(new FakeSessionStore(session))

    expect(screen.getByText('Signed in as ada@example.com')).toBeInTheDocument()
  })

  it('does not restore a session that has expired, and forgets it', () => {
    const store = new FakeSessionStore(aSession({ expiresAt: NOW }))

    renderWithStore(store)

    expect(screen.getByText('Signed out')).toBeInTheDocument()
    expect(store.stored).toBeNull()
  })

  it('starts a session and remembers it', async () => {
    const store = new FakeSessionStore()
    const { user } = renderWithStore(store)
    expect(screen.getByText('Signed out')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByText('Signed in as ada@example.com')).toBeInTheDocument()
    expect(store.stored).toEqual(session)
  })

  it('ends the session and forgets it', async () => {
    const store = new FakeSessionStore(session)
    const { user } = renderWithStore(store)

    await user.click(screen.getByRole('button', { name: 'End' }))

    expect(screen.getByText('Signed out')).toBeInTheDocument()
    expect(store.stored).toBeNull()
  })

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
})

describe('useSession', () => {
  it('explains that it needs a SessionProvider', () => {
    // React logs the thrown render error; silence it to keep the output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<SessionProbe />)).toThrow('useSession must be used inside a SessionProvider')
  })
})
