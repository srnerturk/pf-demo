import type { Captcha } from '../domain/captcha'

/** Port: hands out a new captcha to answer when signing in. Implemented in infrastructure. */
export interface CaptchaIssuer {
  issueCaptcha(): Promise<Captcha>
}

export type RequestCaptcha = () => Promise<Captcha>

export function makeRequestCaptcha(issuer: CaptchaIssuer): RequestCaptcha {
  return () => issuer.issueCaptcha()
}
