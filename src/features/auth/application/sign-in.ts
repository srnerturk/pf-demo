import type { SignInAttempt, SignInChallenge } from '../domain/authentication'
import { validateCaptchaText, type CaptchaViolation } from '../domain/captcha'
import { validateCredentials, type CredentialsViolations } from '../domain/credentials'

/** Port: checks credentials and the captcha answer, then issues a one-time-code challenge. Implemented in infrastructure. */
export interface CredentialVerifier {
  verifyCredentials(attempt: SignInAttempt): Promise<SignInChallenge>
}

export type SignIn = (attempt: SignInAttempt) => Promise<SignInChallenge>

export type SignInViolations = CredentialsViolations & { captcha?: CaptchaViolation }

export class InvalidCredentialsInputError extends Error {
  readonly violations: SignInViolations

  constructor(violations: SignInViolations) {
    super(`Invalid credentials input: ${Object.keys(violations).join(', ')}`)
    this.name = 'InvalidCredentialsInputError'
    this.violations = violations
  }
}

export function makeSignIn(verifier: CredentialVerifier): SignIn {
  return async (draft) => {
    const attempt: SignInAttempt = {
      credentials: { email: draft.credentials.email.trim(), password: draft.credentials.password },
      captcha: { key: draft.captcha.key, text: draft.captcha.text.trim() },
      remember: draft.remember,
    }

    const violations: SignInViolations = validateCredentials(attempt.credentials)
    const captchaViolation = validateCaptchaText(attempt.captcha.text)
    if (captchaViolation) violations.captcha = captchaViolation
    if (Object.keys(violations).length > 0) {
      throw new InvalidCredentialsInputError(violations)
    }

    return verifier.verifyCredentials(attempt)
  }
}

/** Thrown by a CredentialVerifier when the email and password don't match an account. */
export class CredentialsRejectedError extends Error {
  constructor() {
    super('Credentials rejected')
    this.name = 'CredentialsRejectedError'
  }
}

/** Thrown by a CredentialVerifier when the captcha answer doesn't match the picture (or the captcha expired). */
export class CaptchaRejectedError extends Error {
  constructor() {
    super('Captcha answer rejected')
    this.name = 'CaptchaRejectedError'
  }
}
