import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CredentialsRejectedError } from '../application/sign-in'
import { OneTimeCodeRejectedError } from '../application/verify-one-time-code'
import { InMemoryAuthenticator } from './in-memory-authenticator'

const account = { email: 'ada@example.com', password: 'password123', oneTimeCode: '123456' }

describe('in-memory authenticator', () => {
  it('issues a challenge for a known account', async () => {
    const authenticator = new InMemoryAuthenticator({ account })

    const challenge = await authenticator.verifyCredentials({ email: account.email, password: account.password })

    expect(challenge).toEqual({ id: expect.any(String), email: account.email })
  })

  it('matches the email case-insensitively', async () => {
    const authenticator = new InMemoryAuthenticator({ account })

    const challenge = await authenticator.verifyCredentials({ email: 'ADA@example.com', password: account.password })

    expect(challenge.email).toBe(account.email)
  })

  it('rejects a wrong password', async () => {
    const authenticator = new InMemoryAuthenticator({ account })

    await expect(
      authenticator.verifyCredentials({ email: account.email, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(CredentialsRejectedError)
  })

  it('rejects an unknown email', async () => {
    const authenticator = new InMemoryAuthenticator({ account })

    await expect(
      authenticator.verifyCredentials({ email: 'grace@example.com', password: account.password }),
    ).rejects.toBeInstanceOf(CredentialsRejectedError)
  })

  it('opens a session when the challenge is answered with the right code', async () => {
    const authenticator = new InMemoryAuthenticator({ account })
    const challenge = await authenticator.verifyCredentials({ email: account.email, password: account.password })

    await expect(authenticator.verifyCode(challenge.id, account.oneTimeCode)).resolves.toEqual({
      email: account.email,
    })
  })

  it('rejects a wrong code', async () => {
    const authenticator = new InMemoryAuthenticator({ account })
    const challenge = await authenticator.verifyCredentials({ email: account.email, password: account.password })

    await expect(authenticator.verifyCode(challenge.id, '000000')).rejects.toBeInstanceOf(OneTimeCodeRejectedError)
  })

  it('accepts each challenge only once', async () => {
    const authenticator = new InMemoryAuthenticator({ account })
    const challenge = await authenticator.verifyCredentials({ email: account.email, password: account.password })
    await authenticator.verifyCode(challenge.id, account.oneTimeCode)

    await expect(authenticator.verifyCode(challenge.id, account.oneTimeCode)).rejects.toBeInstanceOf(
      OneTimeCodeRejectedError,
    )
  })

  it('rejects a code for a challenge it never issued', async () => {
    const authenticator = new InMemoryAuthenticator({ account })

    await expect(authenticator.verifyCode('unknown', account.oneTimeCode)).rejects.toBeInstanceOf(
      OneTimeCodeRejectedError,
    )
  })

  it('records every code it resends', async () => {
    const authenticator = new InMemoryAuthenticator({ account })
    const challenge = await authenticator.verifyCredentials({ email: account.email, password: account.password })

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

      void authenticator.verifyCredentials({ email: account.email, password: account.password }).then(onAnswered)

      await vi.advanceTimersByTimeAsync(399)
      expect(onAnswered).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(1)
      expect(onAnswered).toHaveBeenCalledOnce()
    })
  })
})
