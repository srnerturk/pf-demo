import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SessionStore } from '../application/session-store'
import { hasExpired, type Session } from '../domain/authentication'
import { SessionContext, type SessionContextValue } from './session-context'

interface SessionProviderProps {
  store: SessionStore
  /** The current time in milliseconds since the epoch; tests pass a fixed clock. */
  now?: () => number
  children: ReactNode
}

/** A remembered session that has already expired is forgotten rather than restored. */
function restore(store: SessionStore, now: number): Session | null {
  const session = store.load()
  if (session && hasExpired(session, now)) {
    store.clear()
    return null
  }
  return session
}

/** Holds who is signed in for the whole app, remembering it through the store, until it expires or ends. */
export function SessionProvider({ store, now = Date.now, children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(() => restore(store, now()))

  useEffect(() => {
    if (!session) return
    const timer = setTimeout(() => {
      store.clear()
      setSession(null)
    }, session.tokens.expiresAt - now())
    return () => clearTimeout(timer)
  }, [session, store, now])

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      startSession(next) {
        store.save(next)
        setSession(next)
      },
      endSession() {
        store.clear()
        setSession(null)
      },
    }),
    [session, store],
  )

  return <SessionContext value={value}>{children}</SessionContext>
}
