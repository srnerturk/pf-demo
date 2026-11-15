import type { CaptchaIssuer } from '../application/request-captcha'
import { CaptchaRejectedError, CredentialsRejectedError, type CredentialVerifier } from '../application/sign-in'
import { OneTimeCodeRejectedError, type OneTimeCodeVerifier } from '../application/verify-one-time-code'
import type { Session, SignInAttempt, SignInChallenge } from '../domain/authentication'
import type { Captcha } from '../domain/captcha'

interface HttpAuthApiOptions {
  /** Where the auth service lives, e.g. https://pf-auth-uat.halkode.com.tr */
  baseUrl: string
  fetch: typeof globalThis.fetch
  /** This browser's id, sent with every sign-in. */
  deviceId: () => string
}

/** Wire format of GET /auth/captcha. */
interface CaptchaResponse {
  captcha_key: string
  /** A data URL, e.g. data:image/png;base64,… */
  image: string
}

/** Wire format of POST /auth/login. */
interface LoginRequest {
  captcha: string
  captcha_key: string
  client_type: 'admin'
  device_id: string
  email: string
  password: string
  remember: boolean
  remote_login: true
}

/** Wire format of a 200 from POST /auth/login when a one-time code must follow. */
interface OtpRequiredResponse {
  otp_required: true
  user_id: number
  /** The code itself; only test environments send it. */
  otp_code?: string
}

/** Wire format of POST /auth/otp/verify. */
interface OtpVerifyRequest {
  client_type: 'admin'
  otp: string
  user_id: number
}

/** Statuses with which /auth/otp/verify turns down a wrong or expired code. */
const CODE_REJECTED_STATUSES = new Set([400, 401, 422])

/** Adapter for the PF auth service's HTTP API. */
export class HttpAuthApi implements CaptchaIssuer, CredentialVerifier, OneTimeCodeVerifier {
  private readonly baseUrl: string
  private readonly send: typeof globalThis.fetch
  private readonly deviceId: () => string

  constructor({ baseUrl, fetch, deviceId }: HttpAuthApiOptions) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    // Called on its own, never as a method of this object: browsers reject `fetch` with a foreign `this`.
    this.send = (input, init) => fetch(input, init)
    this.deviceId = deviceId
  }

  async issueCaptcha(): Promise<Captcha> {
    const response = await this.send(this.url('auth/captcha'), { method: 'GET' })
    if (!response.ok) throw unexpectedStatus('GET /auth/captcha', response)

    const body: unknown = await response.json()
    if (!isCaptchaResponse(body)) throw new Error('The auth service did not answer with a captcha')
    return { key: body.captcha_key, image: body.image }
  }

  async verifyCredentials({ credentials, captcha, remember }: SignInAttempt): Promise<SignInChallenge> {
    const request: LoginRequest = {
      captcha: captcha.text,
      captcha_key: captcha.key,
      client_type: 'admin',
      device_id: this.deviceId(),
      email: credentials.email,
      password: credentials.password,
      remember,
      remote_login: true,
    }
    const response = await this.postJson('auth/login', request)

    if (response.status === 401) throw new CredentialsRejectedError()
    if (response.status === 422) throw new CaptchaRejectedError()
    if (!response.ok) throw unexpectedStatus('POST /auth/login', response)

    const body: unknown = await response.json()
    if (!isOtpRequiredResponse(body)) {
      throw new Error('The auth service signed in without a one-time code, which this app does not support yet')
    }
    // The challenge token itself travels as an httponly cookie; the user id is what verifying needs.
    const challenge: SignInChallenge = { id: String(body.user_id), email: credentials.email }
    if (body.otp_code !== undefined) challenge.revealedCode = body.otp_code
    return challenge
  }

  async verifyCode(challenge: SignInChallenge, code: string): Promise<Session> {
    const request: OtpVerifyRequest = { client_type: 'admin', otp: code, user_id: Number(challenge.id) }
    const response = await this.postJson('auth/otp/verify', request)

    if (CODE_REJECTED_STATUSES.has(response.status)) throw new OneTimeCodeRejectedError()
    if (!response.ok) throw unexpectedStatus('POST /auth/otp/verify', response)
    return { email: challenge.email }
  }

  /** Sign-in steps share a cookie (set by login, read by verify), so they always send credentials. */
  private postJson(path: string, body: unknown): Promise<Response> {
    return this.send(this.url(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
  }

  private url(path: string): string {
    return new URL(path, this.baseUrl).toString()
  }
}

function unexpectedStatus(endpoint: string, response: Response): Error {
  return new Error(`The auth service answered ${endpoint} with ${response.status}`)
}

function isCaptchaResponse(body: unknown): body is CaptchaResponse {
  if (typeof body !== 'object' || body === null) return false
  const { captcha_key, image } = body as Record<string, unknown>
  return typeof captcha_key === 'string' && typeof image === 'string'
}

function isOtpRequiredResponse(body: unknown): body is OtpRequiredResponse {
  if (typeof body !== 'object' || body === null) return false
  const { otp_required, user_id, otp_code } = body as Record<string, unknown>
  return (
    otp_required === true && typeof user_id === 'number' && (otp_code === undefined || typeof otp_code === 'string')
  )
}
