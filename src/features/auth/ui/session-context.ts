import { createContext } from 'react'
import type { Session } from '../domain/authentication'

export interface SessionContextValue {
  /** The signed-in session, or null when nobody is signed in. */
  session: Session | null
  startSession(session: Session): void
  endSession(): void
}

export const SessionContext = createContext<SessionContextValue | null>(null)
