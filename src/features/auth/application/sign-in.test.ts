import { describe, expect, it } from 'vitest'
import type { SignInAttempt, SignInChallenge } from '../domain/authentication'
import { InvalidCredentialsInputError, makeSignIn, type CredentialVerifier } from './sign-in'

class RecordingVerifier implements CredentialVerifier {
  readonly received: SignInAttempt[] = []
  async verifyCredentials(attempt: SignInAttempt): Promise<SignInChallenge> {
    this.received.push(attempt)
<<<<<<< HEAD
    return { id: 'challenge-1', email: attempt.credentials.email }
=======
    return { id: 'challenge-1', email: attempt.credentials.email, remember: attempt.remember }
>>>>>>> development
  }
}

const validAttempt: SignInAttempt = {
  credentials: { email: 'ada@example.com', password: 'password123' },
  captcha: { key: 'captcha-1', text: 'QZWL' },
  remember: false,
}

describe('sign in', () => {
  it('verifies the attempt, tidied up, and returns the challenge to answer with a one-time code', async () => {
    const verifier = new RecordingVerifier()
    const signIn = makeSignIn(verifier)

    const challenge = await signIn({
      credentials: { email: ' ada@example.com ', password: ' secret password ' },
      captcha: { key: 'captcha-1', text: ' QZWL ' },
      remember: true,
    })

<<<<<<< HEAD
    expect(challenge).toEqual({ id: 'challenge-1', email: 'ada@example.com' })
=======
    expect(challenge).toEqual({ id: 'challenge-1', email: 'ada@example.com', remember: true })
>>>>>>> development
    expect(verifier.received).toEqual([
      {
        credentials: { email: 'ada@example.com', password: ' secret password ' },
        captcha: { key: 'captcha-1', text: 'QZWL' },
        remember: true,
      },
    ])
  })

  it('refuses invalid input without contacting the verifier', async () => {
    const verifier = new RecordingVerifier()
    const signIn = makeSignIn(verifier)

    const attempt = signIn({
      credentials: { email: 'ada@', password: '' },
      captcha: { key: 'captcha-1', text: ' ' },
      remember: false,
    })

    await expect(attempt).rejects.toBeInstanceOf(InvalidCredentialsInputError)
    await expect(attempt).rejects.toMatchObject({
      violations: { email: 'invalid-email', password: 'required', captcha: 'required' },
    })
    expect(verifier.received).toEqual([])
  })

  it('lets a rejection from the verifier reach the caller', async () => {
    const rejection = new Error('rejected')
    const signIn = makeSignIn({ verifyCredentials: () => Promise.reject(rejection) })

    await expect(signIn(validAttempt)).rejects.toBe(rejection)
  })
})
