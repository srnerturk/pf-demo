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
  /** Carried over from the attempt, so the session it leads to knows whether to outlive this visit. */
  remember: boolean
  /** The code itself, when the issuer hands it back (test environments do), so it can be filled in. */
  revealedCode?: string
}

/** The person a session belongs to. */
export interface SignedInUser {
  id: string
  name: string
  email: string
}

/** What proves the session to the services it calls. */
export interface SessionTokens {
  accessToken: string
  refreshToken: string
  /** When the access token stops working, in milliseconds since the epoch. */
  expiresAt: number
}

/** A completed sign-in. */
export interface Session {
  user: SignedInUser
  tokens: SessionTokens
  /** Whether the person asked to stay signed in on this device after this visit. */
  remember: boolean
}

/** A session ends when its access token stops working; there is no way to renew it yet. */
export function hasExpired(session: Session, now: number): boolean {
  return now >= session.tokens.expiresAt
}
