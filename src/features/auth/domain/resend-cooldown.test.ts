import { describe, expect, it } from 'vitest'
import { secondsUntilResend } from './resend-cooldown'

describe('resend cooldown', () => {
  const sentAt = 1_000_000

  it('lasts the whole cooldown right after a code is sent', () => {
    expect(secondsUntilResend({ sentAt, now: sentAt, cooldownSeconds: 30 })).toBe(30)
  })

  it('rounds partial seconds up, so it never shows zero too early', () => {
    expect(secondsUntilResend({ sentAt, now: sentAt + 29_001, cooldownSeconds: 30 })).toBe(1)
  })

  it('reaches zero when the cooldown has passed', () => {
    expect(secondsUntilResend({ sentAt, now: sentAt + 30_000, cooldownSeconds: 30 })).toBe(0)
  })

  it('never goes below zero', () => {
    expect(secondsUntilResend({ sentAt, now: sentAt + 90_000, cooldownSeconds: 30 })).toBe(0)
  })
})
