import type { SignInChallenge } from '../domain/authentication'

/** Port: delivers a fresh one-time code for a challenge. Implemented in infrastructure. */
export interface OneTimeCodeSender {
  resendCode(challengeId: string): Promise<void>
}

export type ResendOneTimeCode = (challenge: SignInChallenge) => Promise<void>

export function makeResendOneTimeCode(sender: OneTimeCodeSender): ResendOneTimeCode {
  return (challenge) => sender.resendCode(challenge.id)
}
