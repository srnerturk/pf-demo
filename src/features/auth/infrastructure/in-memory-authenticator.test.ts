import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CredentialsRejectedError } from '../application/sign-in'
import { OneTimeCodeRejectedError } from '../application/verify-one-time-code'
import type { SignInAttempt } from '../domain/authentication'
import { InMemoryAuthenticator } from './in-memory-authenticator'

<<<<<<< HEAD
const account = { email: 'ada@example.com', password: 'password123', oneTimeCode: '123456' }

/** The in-memory authenticator checks only the credentials; any captcha answer and choice to be remembered will do. */
const attemptWith = (email: string, password: string): SignInAttempt => ({
  credentials: { email, password },
  captcha: { key: 'captcha-1', text: 'ANY' },
  remember: false,
=======
const account = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'password123', oneTimeCode: '123456' }
const NOW = Date.UTC(2026, 10, 15, 12, 0, 0)

/** The in-memory authenticator checks only the credentials; any captcha answer and choice to be remembered will do. */
const attemptWith = (email: string, password: string, remember = false): SignInAttempt => ({
  credentials: { email, password },
  captcha: { key: 'captcha-1', text: 'ANY' },
  remember,
>>>>>>> development
})

describe('in-memory authenticator', () => {
  it('issues a challenge for a known account', async () => {
    const authenticator = new InMemoryAuthenticator({ account })

    const challenge = await authenticator.verifyCredentials(attemptWith(account.email, account.password))

<<<<<<< HEAD
    expect(challenge).toEqual({ id: expect.any(String), email: account.email })
=======
    expect(challenge).toEqual({ id: expect.any(String), email: account.email, remember: false })
>>>>>>> development
  })

  it('matches the email case-insensitively', async () => {
    const authenticator = new InMemoryAuthenticator({ account })

    const challenge = await authenticator.verifyCredentials(attemptWith('ADA@example.com', account.password))

    expect(challenge.email).toBe(account.email)
  })

  it('rejects a wrong password', async () => {
    const authenticator = new InMemoryAuthenticator({ account })

    await expect(
      authenticator.verifyCredentials(attemptWith(account.email, 'wrong-password')),
    ).rejects.toBeInstanceOf(CredentialsRejectedError)
  })

  it('rejects an unknown email', async () => {
    const authenticator = new InMemoryAuthenticator({ account })

    await expect(
      authenticator.verifyCredentials(attemptWith('grace@example.com', account.password)),
    ).rejects.toBeInstanceOf(CredentialsRejectedError)
  })

<<<<<<< HEAD
  it('opens a session when the challenge is answered with the right code', async () => {
    const authenticator = new InMemoryAuthenticator({ account })
    const challenge = await authenticator.verifyCredentials(attemptWith(account.email, account.password))

    await expect(authenticator.verifyCode(challenge, account.oneTimeCode)).resolves.toEqual({
      email: account.email,
      accessToken: expect.any(String),
=======
  it('opens an hour-long session when the challenge is answered with the right code', async () => {
    const authenticator = new InMemoryAuthenticator({ account, now: () => NOW })
    const challenge = await authenticator.verifyCredentials(attemptWith(account.email, account.password, true))

    await expect(authenticator.verifyCode(challenge, account.oneTimeCode)).resolves.toEqual({
      user: { id: expect.any(String), name: account.name, email: account.email },
      tokens: { accessToken: expect.any(String), refreshToken: expect.any(String), expiresAt: NOW + 60 * 60 * 1000 },
      remember: true,
>>>>>>> development
    })
  })

  it('rejects a wrong code', async () => {
    const authenticator = new InMemoryAuthenticator({ account })
    const challenge = await authenticator.verifyCredentials(attemptWith(account.email, account.password))

    await expect(authenticator.verifyCode(challenge, '000000')).rejects.toBeInstanceOf(OneTimeCodeRejectedError)
  })

  it('accepts each challenge only once', async () => {
    const authenticator = new InMemoryAuthenticator({ account })
    const challenge = await authenticator.verifyCredentials(attemptWith(account.email, account.password))
    await authenticator.verifyCode(challenge, account.oneTimeCode)

    await expect(authenticator.verifyCode(challenge, account.oneTimeCode)).rejects.toBeInstanceOf(
      OneTimeCodeRejectedError,
    )
  })

  it('rejects a code for a challenge it never issued', async () => {
    const authenticator = new InMemoryAuthenticator({ account })

<<<<<<< HEAD
    await expect(authenticator.verifyCode({ id: 'unknown', email: account.email }, account.oneTimeCode)).rejects.toBeInstanceOf(
=======
    await expect(authenticator.verifyCode({ id: 'unknown', email: account.email, remember: false }, account.oneTimeCode)).rejects.toBeInstanceOf(
>>>>>>> development
      OneTimeCodeRejectedError,
    )
  })

  it('records every code it resends', async () => {
    const authenticator = new InMemoryAuthenticator({ account })
    const challenge = await authenticator.verifyCredentials(attemptWith(account.email, account.password))

    await authenticator.resendCode(challenge.id)

    expect(authenticator.resentChallengeIds).toEqual([challenge.id])
  })

  describe('with simulated latency', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('answers only after the latency has passed', async () => {
      const authenticator = new InMemoryAuthenticator({ account, latencyMs: 400 })
      const onAnswered = vi.fn<() => void>()

      void authenticator.verifyCredentials(attemptWith(account.email, account.password)).then(onAnswered)

      await vi.advanceTimersByTimeAsync(399)
      expect(onAnswered).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(1)
      expect(onAnswered).toHaveBeenCalledOnce()
    })
  })
})
