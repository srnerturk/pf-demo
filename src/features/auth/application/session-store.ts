import type { Session } from '../domain/authentication'

/** Port: remembers the signed-in session between visits. Implemented in infrastructure. */
export interface SessionStore {
  load(): Session | null
  save(session: Session): void
  clear(): void
}
