/** A pending sign-in: credentials were accepted, a one-time code must now be confirmed. */
export interface SignInChallenge {
  id: string
  email: string
}

/** A completed sign-in. */
export interface Session {
  email: string
}
