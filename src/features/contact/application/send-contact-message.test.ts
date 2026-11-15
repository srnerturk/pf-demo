import { describe, expect, it } from 'vitest'
import type { ContactMessage } from '../domain/contact-message'
import {
  InvalidContactMessageError,
  makeSendContactMessage,
  type ContactMessageSender,
} from './send-contact-message'

class RecordingSender implements ContactMessageSender {
  readonly sent: ContactMessage[] = []
  async send(contactMessage: ContactMessage): Promise<void> {
    this.sent.push(contactMessage)
  }
}

const validMessage: ContactMessage = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello from the analytical engine',
}

describe('send contact message', () => {
  it('sends a valid message through the sender, with surrounding whitespace removed', async () => {
    const sender = new RecordingSender()
    const sendContactMessage = makeSendContactMessage(sender)

    await sendContactMessage({
      name: '  Ada Lovelace ',
      email: ' ada@example.com ',
      message: ' Hello from the analytical engine\n',
    })

    expect(sender.sent).toEqual([validMessage])
  })

  it('refuses an invalid message and sends nothing', async () => {
    const sender = new RecordingSender()
    const sendContactMessage = makeSendContactMessage(sender)

    const attempt = sendContactMessage({ ...validMessage, email: 'not-an-email' })

    await expect(attempt).rejects.toBeInstanceOf(InvalidContactMessageError)
    await expect(attempt).rejects.toMatchObject({ violations: { email: 'invalid-email' } })
    expect(sender.sent).toEqual([])
  })

  it('lets sender failures reach the caller', async () => {
    const outage = new Error('service unavailable')
    const sendContactMessage = makeSendContactMessage({
      send: () => Promise.reject(outage),
    })

    await expect(sendContactMessage(validMessage)).rejects.toBe(outage)
  })
})
