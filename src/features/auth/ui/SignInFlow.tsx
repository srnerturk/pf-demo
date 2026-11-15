import { useState } from 'react'
import type { ResendOneTimeCode } from '../application/resend-one-time-code'
import type { SignIn } from '../application/sign-in'
import type { VerifyOneTimeCode } from '../application/verify-one-time-code'
import type { Session, SignInChallenge } from '../domain/authentication'
import { OneTimeCodeForm } from './OneTimeCodeForm'
import { SignInForm } from './SignInForm'

type Step = { name: 'credentials' } | { name: 'verification'; challenge: SignInChallenge }

/** Which way the flow moved, so the entering screen slides in from the matching side. */
type Direction = 'forward' | 'back'

const ENTER_ANIMATION: Record<Direction, string> = {
  forward: 'animate-screen-forward',
  back: 'animate-screen-back',
}

const DEFAULT_RESEND_COOLDOWN_SECONDS = 30

interface SignInFlowProps {
  signIn: SignIn
  verifyOneTimeCode: VerifyOneTimeCode
  resendOneTimeCode: ResendOneTimeCode
  resendCooldownSeconds?: number
  /** Called once the one-time code is confirmed; the flow's job ends here. */
  onSignedIn: (session: Session) => void
}

export function SignInFlow({
  signIn,
  verifyOneTimeCode,
  resendOneTimeCode,
  resendCooldownSeconds = DEFAULT_RESEND_COOLDOWN_SECONDS,
  onSignedIn,
}: SignInFlowProps) {
  const [step, setStep] = useState<Step>({ name: 'credentials' })
  const [direction, setDirection] = useState<Direction>('forward')

  function goTo(next: Step, towards: Direction) {
    setDirection(towards)
    setStep(next)
  }

  return (
    <div key={step.name} className={`${ENTER_ANIMATION[direction]} motion-reduce:animate-none`}>
      {step.name === 'credentials' && (
        <SignInForm
          signIn={signIn}
          onChallengeIssued={(challenge) => goTo({ name: 'verification', challenge }, 'forward')}
        />
      )}
      {step.name === 'verification' && (
        <OneTimeCodeForm
          challenge={step.challenge}
          verifyOneTimeCode={verifyOneTimeCode}
          resendOneTimeCode={resendOneTimeCode}
          resendCooldownSeconds={resendCooldownSeconds}
          onVerified={onSignedIn}
          onChangeEmail={() => goTo({ name: 'credentials' }, 'back')}
        />
      )}
    </div>
  )
}
