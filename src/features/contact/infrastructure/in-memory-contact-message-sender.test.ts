import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ContactMessage } from '../domain/contact-message'
import { InMemoryContactMessageSender } from './in-memory-contact-message-sender'

const contactMessage: ContactMessage = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello from the analytical engine',
}

describe('in-memory contact message sender', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps every sent message', async () => {
    const sender = new InMemoryContactMessageSender()

    const sending = sender.send(contactMessage)
    await vi.runAllTimersAsync()
    await sending

    expect(sender.sent).toEqual([contactMessage])
  })

  it('completes only after the simulated latency', async () => {
    const sender = new InMemoryContactMessageSender({ latencyMs: 500 })
    const onSent = vi.fn<() => void>()

    void sender.send(contactMessage).then(onSent)

    await vi.advanceTimersByTimeAsync(499)
    expect(onSent).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(onSent).toHaveBeenCalledOnce()
  })
})
