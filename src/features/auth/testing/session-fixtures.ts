import type { Session } from '../domain/authentication'

/** A session an hour from expiring, for tests that only care about who is signed in. */
export function aSession({
  email = 'ada@example.com',
  remember = false,
  expiresAt = Date.now() + 60 * 60 * 1000,
}: { email?: string; remember?: boolean; expiresAt?: number } = {}): Session {
  return {
    user: { id: 'user-1', name: 'Ada Lovelace', email },
    tokens: { accessToken: `access-for-${email}`, refreshToken: `refresh-for-${email}`, expiresAt },
    remember,
  }
}
