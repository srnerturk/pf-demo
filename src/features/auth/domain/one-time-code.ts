export const ONE_TIME_CODE_LENGTH = 6

export type OneTimeCodeViolation = 'required' | 'not-digits' | 'wrong-length'

const DIGITS_ONLY = /^\d+$/

export function validateOneTimeCode(code: string): OneTimeCodeViolation | null {
  if (code.length === 0) return 'required'
  if (!DIGITS_ONLY.test(code)) return 'not-digits'
  return code.length === ONE_TIME_CODE_LENGTH ? null : 'wrong-length'
}
