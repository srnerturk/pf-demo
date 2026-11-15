import { describe, expect, it } from 'vitest'
import { validateCaptchaText } from './captcha'

describe('captcha rules', () => {
  it('needs the characters read from the picture', () => {
    expect(validateCaptchaText('')).toBe('required')
  })

  it('does not count whitespace as an answer', () => {
    expect(validateCaptchaText('   ')).toBe('required')
  })

  it('accepts whatever was read, leaving the comparison to whoever issued the captcha', () => {
    expect(validateCaptchaText('QZWL')).toBeNull()
  })
})
