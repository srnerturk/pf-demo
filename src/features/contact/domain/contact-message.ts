export interface ContactMessage {
  name: string
  email: string
  message: string
}

export type ContactMessageViolation = 'required' | 'invalid-email' | 'too-short'

export type ContactMessageViolations = Partial<Record<keyof ContactMessage, ContactMessageViolation>>

export const MESSAGE_MIN_LENGTH = 10

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateName(name: string): ContactMessageViolation | null {
  return isBlank(name) ? 'required' : null
}

export function validateEmail(email: string): ContactMessageViolation | null {
  if (isBlank(email)) return 'required'
  return EMAIL_PATTERN.test(email.trim()) ? null : 'invalid-email'
}

export function validateMessage(message: string): ContactMessageViolation | null {
  if (isBlank(message)) return 'required'
  return message.trim().length < MESSAGE_MIN_LENGTH ? 'too-short' : null
}

const RULES: Record<keyof ContactMessage, (value: string) => ContactMessageViolation | null> = {
  name: validateName,
  email: validateEmail,
  message: validateMessage,
}

export function validateContactMessage(contactMessage: ContactMessage): ContactMessageViolations {
  const violations: ContactMessageViolations = {}
  for (const field of Object.keys(RULES) as (keyof ContactMessage)[]) {
    const violation = RULES[field](contactMessage[field])
    if (violation) violations[field] = violation
  }
  return violations
}

function isBlank(value: string): boolean {
  return value.trim().length === 0
}
