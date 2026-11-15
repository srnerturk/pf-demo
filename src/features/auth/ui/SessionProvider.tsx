import { useMemo, useState, type ReactNode } from 'react'
import type { SessionStore } from '../application/session-store'
import type { Session } from '../domain/authentication'
import { SessionContext, type SessionContextValue } from './session-context'

interface SessionProviderProps {
  store: SessionStore
  children: ReactNode
}

/** Holds who is signed in for the whole app, remembering it through the store. */
export function SessionProvider({ store, children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(() => store.load())

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
