import type { CaptchaAnswer } from './captcha'
import type { Credentials } from './credentials'

/** Everything a person hands over when they try to sign in. */
export interface SignInAttempt {
  credentials: Credentials
  captcha: CaptchaAnswer
  /** Whether the person asked to stay signed in on this device. */
  remember: boolean
}

/** A pending sign-in: credentials were accepted, a one-time code must now be confirmed. */
export interface SignInChallenge {
  /** Whatever the issuer needs to recognise the challenge again; opaque to everyone else. */
  id: string
  email: string
  /** The code itself, when the issuer hands it back (test environments do), so it can be filled in. */
  revealedCode?: string
}

/** A completed sign-in. */
export interface Session {
  email: string
}
