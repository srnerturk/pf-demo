import { useState } from 'react'
import { textButtonClassName } from './button-styles'
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
      <p className="text-slate-500">
        Didn’t get the code?{' '}
        <button
          type="button"
          onClick={resend}
          disabled={state === 'sending' || secondsLeft > 0}
          className={`${textButtonClassName} tabular-nums`}
        >
          {label}
        </button>
      </p>
      {state === 'sent' && <output className="text-emerald-700">We sent you a new code.</output>}
      {state === 'failed' && (
        <p role="alert" className="text-red-700">
          We couldn’t send a new code. Try again.
        </p>
      )}
    </div>
  )
}
