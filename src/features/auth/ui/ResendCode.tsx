import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { useResendCountdown } from './useResendCountdown'

type ResendState = 'idle' | 'sending' | 'sent' | 'failed'

interface ResendCodeProps {
  onResend: () => Promise<void>
  cooldownSeconds: number
}

export function ResendCode({ onResend, cooldownSeconds }: ResendCodeProps) {
  const { secondsLeft, restart } = useResendCountdown(cooldownSeconds)
  const [state, setState] = useState<ResendState>('idle')

  async function resend() {
    setState('sending')
    try {
      await onResend()
      restart()
      setState('sent')
    } catch {
      setState('failed')
    }
  }

  const label = state === 'sending' ? 'Sending…' : secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'

  return (
    <div className="flex flex-col items-center gap-2 text-sm">
      <p className="text-muted-foreground">
        Didn’t get the code?{' '}
        <Button
          type="button"
          variant="link"
          onClick={resend}
          disabled={state === 'sending' || secondsLeft > 0}
          className="h-auto p-0 tabular-nums disabled:text-muted-foreground"
        >
          {label}
        </Button>
      </p>
      {state === 'sent' && <output className="text-success">We sent you a new code.</output>}
      {state === 'failed' && (
        <p role="alert" className="text-destructive">
          We couldn’t send a new code. Try again.
        </p>
      )}
    </div>
  )
}
