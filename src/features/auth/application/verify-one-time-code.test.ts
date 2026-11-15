import { describe, expect, it } from 'vitest'
import type { Session, SignInChallenge } from '../domain/authentication'
<<<<<<< HEAD
=======
import { aSession } from '../testing/session-fixtures'
>>>>>>> development
import {
  InvalidOneTimeCodeInputError,
  makeVerifyOneTimeCode,
  type OneTimeCodeVerifier,
} from './verify-one-time-code'

class RecordingVerifier implements OneTimeCodeVerifier {
  readonly received: { challenge: SignInChallenge; code: string }[] = []
  async verifyCode(challenge: SignInChallenge, code: string): Promise<Session> {
    this.received.push({ challenge, code })
<<<<<<< HEAD
    return { email: 'ada@example.com', accessToken: 'token' }
  }
}

const challenge: SignInChallenge = { id: 'challenge-1', email: 'ada@example.com' }
=======
    return session
  }
}

const challenge: SignInChallenge = { id: 'challenge-1', email: 'ada@example.com', remember: false }
const session = aSession()
>>>>>>> development

describe('verify one-time code', () => {
  it('answers the challenge with the code and returns the session', async () => {
    const verifier = new RecordingVerifier()
    const verifyOneTimeCode = makeVerifyOneTimeCode(verifier)

<<<<<<< HEAD
    const session = await verifyOneTimeCode(challenge, '123456')

    expect(session).toEqual({ email: 'ada@example.com', accessToken: 'token' })
=======
    const opened = await verifyOneTimeCode(challenge, '123456')

    expect(opened).toBe(session)
>>>>>>> development
    expect(verifier.received).toEqual([{ challenge, code: '123456' }])
  })

  it('refuses a malformed code without contacting the verifier', async () => {
    const verifier = new RecordingVerifier()
    const verifyOneTimeCode = makeVerifyOneTimeCode(verifier)

    const attempt = verifyOneTimeCode(challenge, '123')

    await expect(attempt).rejects.toBeInstanceOf(InvalidOneTimeCodeInputError)
    await expect(attempt).rejects.toMatchObject({ violation: 'wrong-length' })
    expect(verifier.received).toEqual([])
  })

  it('lets a rejection from the verifier reach the caller', async () => {
    const rejection = new Error('rejected')
    const verifyOneTimeCode = makeVerifyOneTimeCode({ verifyCode: () => Promise.reject(rejection) })

    await expect(verifyOneTimeCode(challenge, '123456')).rejects.toBe(rejection)
  })
})
