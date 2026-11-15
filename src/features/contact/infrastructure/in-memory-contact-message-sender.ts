import type { ContactMessageSender } from '../application/send-contact-message'
import type { ContactMessage } from '../domain/contact-message'

interface InMemoryContactMessageSenderOptions {
  latencyMs?: number
}

/** Stand-in adapter until a real backend exists; swap it in the composition root. */
export class InMemoryContactMessageSender implements ContactMessageSender {
  readonly sent: ContactMessage[] = []
  private readonly latencyMs: number

  constructor({ latencyMs = 0 }: InMemoryContactMessageSenderOptions = {}) {
    this.latencyMs = latencyMs
  }

  async send(contactMessage: ContactMessage): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs))
    this.sent.push(contactMessage)
  }
}
