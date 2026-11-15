import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SessionStore } from '../application/session-store'
import type { Session } from '../domain/authentication'
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

function SessionProbe() {
  const { session, startSession, endSession } = useSession()
  return (
    <>
      <p>{session ? `Signed in as ${session.email}` : 'Signed out'}</p>
      <button type="button" onClick={() => startSession({ email: 'ada@example.com' })}>
        Start
      </button>
      <button type="button" onClick={endSession}>
        End
      </button>
    </>
  )
}

function renderWithStore(store: SessionStore) {
  const user = userEvent.setup()
  render(
    <SessionProvider store={store}>
      <SessionProbe />
    </SessionProvider>,
  )
  return { user }
}

describe('SessionProvider', () => {
  it('restores the session remembered by the store', () => {
    renderWithStore(new FakeSessionStore({ email: 'ada@example.com' }))

    expect(screen.getByText('Signed in as ada@example.com')).toBeInTheDocument()
  })

  it('starts a session and remembers it', async () => {
    const store = new FakeSessionStore()
    const { user } = renderWithStore(store)
    expect(screen.getByText('Signed out')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByText('Signed in as ada@example.com')).toBeInTheDocument()
    expect(store.stored).toEqual({ email: 'ada@example.com' })
  })

  it('ends the session and forgets it', async () => {
    const store = new FakeSessionStore({ email: 'ada@example.com' })
    const { user } = renderWithStore(store)

    await user.click(screen.getByRole('button', { name: 'End' }))

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
