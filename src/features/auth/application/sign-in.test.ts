import { describe, expect, it } from 'vitest'
import type { SignInChallenge } from '../domain/authentication'
import type { Credentials } from '../domain/credentials'
import { InvalidCredentialsInputError, makeSignIn, type CredentialVerifier } from './sign-in'

class RecordingVerifier implements CredentialVerifier {
  readonly received: Credentials[] = []
  async verifyCredentials(credentials: Credentials): Promise<SignInChallenge> {
    this.received.push(credentials)
    return { id: 'challenge-1', email: credentials.email }
  }
}

describe('sign in', () => {
  it('verifies the credentials and returns the challenge to answer with a one-time code', async () => {
    const verifier = new RecordingVerifier()
    const signIn = makeSignIn(verifier)

    const challenge = await signIn({ email: ' ada@example.com ', password: ' secret password ' })

    expect(challenge).toEqual({ id: 'challenge-1', email: 'ada@example.com' })
    expect(verifier.received).toEqual([{ email: 'ada@example.com', password: ' secret password ' }])
  })

  it('refuses invalid input without contacting the verifier', async () => {
    const verifier = new RecordingVerifier()
    const signIn = makeSignIn(verifier)

    const attempt = signIn({ email: 'ada@', password: 'short' })

    await expect(attempt).rejects.toBeInstanceOf(InvalidCredentialsInputError)
    await expect(attempt).rejects.toMatchObject({
      violations: { email: 'invalid-email', password: 'too-short' },
    })
    expect(verifier.received).toEqual([])
  })

  it('lets a rejection from the verifier reach the caller', async () => {
    const rejection = new Error('rejected')
    const signIn = makeSignIn({ verifyCredentials: () => Promise.reject(rejection) })

    await expect(signIn({ email: 'ada@example.com', password: 'password123' })).rejects.toBe(rejection)
  })
})
