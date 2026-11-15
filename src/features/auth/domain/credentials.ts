export interface Credentials {
  email: string
  password: string
}

export type CredentialsViolation = 'required' | 'invalid-email'

export type CredentialsViolations = Partial<Record<keyof Credentials, CredentialsViolation>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): CredentialsViolation | null {
  const trimmed = email.trim()
  if (trimmed.length === 0) return 'required'
  return EMAIL_PATTERN.test(trimmed) ? null : 'invalid-email'
}

/**
 * Passwords are taken verbatim: whitespace is a legitimate character.
 * Signing in only asks for one; how long it must be was decided when it was set, by the server.
 */
export function validatePassword(password: string): CredentialsViolation | null {
  return password.length === 0 ? 'required' : null
}

const RULES: Record<keyof Credentials, (value: string) => CredentialsViolation | null> = {
  email: validateEmail,
  password: validatePassword,
}

export function validateCredentials(credentials: Credentials): CredentialsViolations {
  const violations: CredentialsViolations = {}
  for (const field of Object.keys(RULES) as (keyof Credentials)[]) {
    const violation = RULES[field](credentials[field])
    if (violation) violations[field] = violation
  }
  return violations
}
