import type { SignInChallenge } from '../domain/authentication'
import { validateCredentials, type Credentials, type CredentialsViolations } from '../domain/credentials'

/** Port: checks credentials and issues a one-time-code challenge. Implemented in infrastructure. */
export interface CredentialVerifier {
  verifyCredentials(credentials: Credentials): Promise<SignInChallenge>
}

export type SignIn = (credentials: Credentials) => Promise<SignInChallenge>

export class InvalidCredentialsInputError extends Error {
  readonly violations: CredentialsViolations

  constructor(violations: CredentialsViolations) {
    super(`Invalid credentials input: ${Object.keys(violations).join(', ')}`)
    this.name = 'InvalidCredentialsInputError'
    this.violations = violations
  }
}

export function makeSignIn(verifier: CredentialVerifier): SignIn {
  return async (draft) => {
    const credentials: Credentials = { email: draft.email.trim(), password: draft.password }

    const violations = validateCredentials(credentials)
    if (Object.keys(violations).length > 0) {
      throw new InvalidCredentialsInputError(violations)
    }

    return verifier.verifyCredentials(credentials)
  }
}

/** Thrown by a CredentialVerifier when the email and password don't match an account. */
export class CredentialsRejectedError extends Error {
  constructor() {
    super('Credentials rejected')
    this.name = 'CredentialsRejectedError'
  }
}
