import type { CaptchaIssuer } from '../application/request-captcha'
import type { Captcha } from '../domain/captcha'

interface HttpAuthApiOptions {
  /** Where the auth service lives, e.g. https://pf-auth-uat.halkode.com.tr */
  baseUrl: string
  fetch: typeof globalThis.fetch
}

/** Wire format of GET /auth/captcha. */
interface CaptchaResponse {
  captcha_key: string
  /** A data URL, e.g. data:image/png;base64,… */
  image: string
}

/** Adapter for the PF auth service's HTTP API. */
export class HttpAuthApi implements CaptchaIssuer {
  private readonly baseUrl: string
  private readonly send: typeof globalThis.fetch

  constructor({ baseUrl, fetch }: HttpAuthApiOptions) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    // Called on its own, never as a method of this object: browsers reject `fetch` with a foreign `this`.
    this.send = (input, init) => fetch(input, init)
  }

  async issueCaptcha(): Promise<Captcha> {
    const body = await this.getJson('auth/captcha')
    if (!isCaptchaResponse(body)) throw new Error('The auth service did not answer with a captcha')
    return { key: body.captcha_key, image: body.image }
  }

  private async getJson(path: string): Promise<unknown> {
    const response = await this.send(new URL(path, this.baseUrl).toString(), { method: 'GET' })
    if (!response.ok) throw new Error(`The auth service answered GET /${path} with ${response.status}`)
    return response.json()
  }
}

function isCaptchaResponse(body: unknown): body is CaptchaResponse {
  if (typeof body !== 'object' || body === null) return false
  const { captcha_key, image } = body as Record<string, unknown>
  return typeof captcha_key === 'string' && typeof image === 'string'
}
