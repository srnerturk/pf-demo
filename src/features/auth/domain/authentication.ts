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
  id: string
  email: string
}

/** A completed sign-in. */
export interface Session {
  email: string
}
