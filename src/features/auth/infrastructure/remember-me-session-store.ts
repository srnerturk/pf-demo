import type { SessionStore } from '../application/session-store'
import type { Session } from '../domain/authentication'

interface RememberMeSessionStoreOptions {
  /** Outlives the visit, e.g. localStorage. */
  acrossVisits: SessionStore
  /** Ends with the visit, e.g. sessionStorage. */
  thisVisitOnly: SessionStore
}

/** Keeps a session across visits only when the person asked to be remembered. */
export class RememberMeSessionStore implements SessionStore {
  private readonly acrossVisits: SessionStore
  private readonly thisVisitOnly: SessionStore

  constructor({ acrossVisits, thisVisitOnly }: RememberMeSessionStoreOptions) {
    this.acrossVisits = acrossVisits
    this.thisVisitOnly = thisVisitOnly
  }

  load(): Session | null {
    return this.acrossVisits.load() ?? this.thisVisitOnly.load()
  }

  save(session: Session): void {
    const [keeper, other] = session.remember
      ? [this.acrossVisits, this.thisVisitOnly]
      : [this.thisVisitOnly, this.acrossVisits]
    other.clear()
    keeper.save(session)
  }

  clear(): void {
    this.acrossVisits.clear()
    this.thisVisitOnly.clear()
  }
}
