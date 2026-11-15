import {
  validateContactMessage,
  type ContactMessage,
  type ContactMessageViolations,
} from '../domain/contact-message'

/** Port: how a contact message leaves the application. Implemented in infrastructure. */
export interface ContactMessageSender {
  send(contactMessage: ContactMessage): Promise<void>
}

export type SendContactMessage = (contactMessage: ContactMessage) => Promise<void>

export class InvalidContactMessageError extends Error {
  readonly violations: ContactMessageViolations

  constructor(violations: ContactMessageViolations) {
    super(`Invalid contact message: ${Object.keys(violations).join(', ')}`)
    this.name = 'InvalidContactMessageError'
    this.violations = violations
  }
}

export function makeSendContactMessage(sender: ContactMessageSender): SendContactMessage {
  return async (draft) => {
    const contactMessage: ContactMessage = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      message: draft.message.trim(),
    }

    const violations = validateContactMessage(contactMessage)
    if (Object.keys(violations).length > 0) {
      throw new InvalidContactMessageError(violations)
    }

    await sender.send(contactMessage)
  }
}
