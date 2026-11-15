import { useCallback, useEffect, useState } from 'react'
import { secondsUntilResend } from '../domain/resend-cooldown'

const TICK_MS = 250

/** Seconds left before another code may be requested; `restart` begins a new cooldown. */
export function useResendCountdown(cooldownSeconds: number) {
  const [sentAt, setSentAt] = useState(() => Date.now())
  const [now, setNow] = useState(sentAt)
  const secondsLeft = secondsUntilResend({ sentAt, now, cooldownSeconds })
  const isCountingDown = secondsLeft > 0

  useEffect(() => {
    if (!isCountingDown) return
    const ticker = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(ticker)
  }, [isCountingDown, sentAt])

  const restart = useCallback(() => {
    const restartedAt = Date.now()
    setSentAt(restartedAt)
    setNow(restartedAt)
  }, [])

  return { secondsLeft, restart }
}
