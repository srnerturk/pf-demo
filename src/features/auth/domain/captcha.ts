/** A picture of characters a person types back to show they are not a bot. */
export interface Captcha {
  /** Identifies this captcha to whoever issued it; sent back with the answer. */
  key: string
  /** Something an <img> can show: a URL or a data URL. */
  image: string
}

/** What a person read from a captcha, tied to the captcha it answers. */
export interface CaptchaAnswer {
  key: string
  text: string
}

export type CaptchaViolation = 'required'

export function validateCaptchaText(text: string): CaptchaViolation | null {
  return text.trim().length === 0 ? 'required' : null
}
