import type { SessionStore } from '../application/session-store'
import type { Session } from '../domain/authentication'

/** Keeps the session in browser Web Storage (localStorage or sessionStorage). */
export class WebStorageSessionStore implements SessionStore {
  static readonly storageKey = 'pf-demo.session'

  private readonly storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  load(): Session | null {
    const stored = this.storage.getItem(WebStorageSessionStore.storageKey)
    if (stored === null) return null

    try {
      const parsed: unknown = JSON.parse(stored)
      return isSession(parsed) ? { email: parsed.email, accessToken: parsed.accessToken } : null
    } catch {
      return null
    }
  }

  save(session: Session): void {
    this.storage.setItem(WebStorageSessionStore.storageKey, JSON.stringify(session))
  }

  clear(): void {
    this.storage.removeItem(WebStorageSessionStore.storageKey)
  }
}

/** Sessions saved before access tokens existed don't qualify: their owner signs in again. */
function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false
  const { email, accessToken } = value as Record<string, unknown>
  return typeof email === 'string' && typeof accessToken === 'string'
}
