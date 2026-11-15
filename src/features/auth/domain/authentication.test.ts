import { describe, expect, it } from 'vitest'
import { hasExpired, type Session } from './authentication'

const expiresAt = Date.UTC(2026, 10, 15, 13, 0, 0)

const session: Session = {
  user: { id: '2763', name: 'Ada Lovelace', email: 'ada@example.com' },
  tokens: { accessToken: 'access', refreshToken: 'refresh', expiresAt },
  remember: false,
}

describe('session expiry', () => {
  it('holds until its access expires', () => {
    expect(hasExpired(session, expiresAt - 1)).toBe(false)
  })

  it('has expired from the moment its access expires', () => {
    expect(hasExpired(session, expiresAt)).toBe(true)
  })
})
