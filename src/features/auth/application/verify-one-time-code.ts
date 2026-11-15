import type { Session, SignInChallenge } from '../domain/authentication'
import { validateOneTimeCode, type OneTimeCodeViolation } from '../domain/one-time-code'

/** Port: confirms the one-time code for a challenge. Implemented in infrastructure. */
export interface OneTimeCodeVerifier {
  verifyCode(challenge: SignInChallenge, code: string): Promise<Session>
}

export type VerifyOneTimeCode = (challenge: SignInChallenge, code: string) => Promise<Session>

export class InvalidOneTimeCodeInputError extends Error {
  readonly violation: OneTimeCodeViolation

  constructor(violation: OneTimeCodeViolation) {
    super(`Invalid one-time code input: ${violation}`)
    this.name = 'InvalidOneTimeCodeInputError'
    this.violation = violation
  }
}

export function makeVerifyOneTimeCode(verifier: OneTimeCodeVerifier): VerifyOneTimeCode {
  return async (challenge, code) => {
    const violation = validateOneTimeCode(code)
    if (violation) throw new InvalidOneTimeCodeInputError(violation)

    return verifier.verifyCode(challenge, code)
  }
}

/** Thrown by a OneTimeCodeVerifier when the code doesn't answer the challenge. */
export class OneTimeCodeRejectedError extends Error {
  constructor() {
    super('One-time code rejected')
    this.name = 'OneTimeCodeRejectedError'
  }
}
