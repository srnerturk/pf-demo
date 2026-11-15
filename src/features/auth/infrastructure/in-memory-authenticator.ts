import type { OneTimeCodeSender } from '../application/resend-one-time-code'
import { CredentialsRejectedError, type CredentialVerifier } from '../application/sign-in'
import { OneTimeCodeRejectedError, type OneTimeCodeVerifier } from '../application/verify-one-time-code'
import type { Session, SignInAttempt, SignInChallenge } from '../domain/authentication'

export interface InMemoryAccount {
  name: string
  email: string
  password: string
  oneTimeCode: string
}

interface InMemoryAuthenticatorOptions {
  account: InMemoryAccount
  latencyMs?: number
  now?: () => number
}

const SESSION_LIFETIME_MS = 60 * 60 * 1000

/** Stand-in for a real authentication API; swap it in the composition root. */
export class InMemoryAuthenticator implements CredentialVerifier, OneTimeCodeVerifier, OneTimeCodeSender {
  readonly resentChallengeIds: string[] = []
  private readonly account: InMemoryAccount
  private readonly latencyMs: number
  private readonly now: () => number
  private readonly openChallenges = new Map<string, SignInChallenge>()
  private issuedChallenges = 0

  constructor({ account, latencyMs = 0, now = Date.now }: InMemoryAuthenticatorOptions) {
    this.account = account
    this.latencyMs = latencyMs
    this.now = now
  }

  /** Checks only the credentials: the captcha answer and the choice to be remembered are ignored. */
  async verifyCredentials({ credentials: { email, password }, remember }: SignInAttempt): Promise<SignInChallenge> {
    await this.simulateLatency()
    const isKnownAccount = email.toLowerCase() === this.account.email.toLowerCase() && password === this.account.password
    if (!isKnownAccount) throw new CredentialsRejectedError()

    this.issuedChallenges += 1
    const challenge: SignInChallenge = { id: `challenge-${this.issuedChallenges}`, email: this.account.email, remember }
    this.openChallenges.set(challenge.id, challenge)
    return challenge
  }

  async verifyCode({ id }: SignInChallenge, code: string): Promise<Session> {
    await this.simulateLatency()
    const challenge = this.openChallenges.get(id)
    if (!challenge || code !== this.account.oneTimeCode) throw new OneTimeCodeRejectedError()

    this.openChallenges.delete(id)
    return {
      user: { id: 'in-memory-user', name: this.account.name, email: this.account.email },
      tokens: {
        accessToken: `in-memory-access-${id}`,
        refreshToken: `in-memory-refresh-${id}`,
        expiresAt: this.now() + SESSION_LIFETIME_MS,
      },
      remember: challenge.remember,
    }
  }

  async resendCode(challengeId: string): Promise<void> {
    await this.simulateLatency()
    this.resentChallengeIds.push(challengeId)
  }

  private simulateLatency(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.latencyMs))
  }
}
