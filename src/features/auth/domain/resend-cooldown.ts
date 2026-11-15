interface ResendCooldown {
  /** Epoch milliseconds when the last code was sent. */
  sentAt: number
  /** Epoch milliseconds right now. */
  now: number
  cooldownSeconds: number
}

export function secondsUntilResend({ sentAt, now, cooldownSeconds }: ResendCooldown): number {
  const remainingMs = sentAt + cooldownSeconds * 1000 - now
  return Math.max(0, Math.ceil(remainingMs / 1000))
}
