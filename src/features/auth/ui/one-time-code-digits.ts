import { ONE_TIME_CODE_LENGTH, validateOneTimeCode } from '../domain/one-time-code'

/** The code as the input edits it: one entry per box, `''` for an empty box. */
export function emptyOneTimeCode(): string[] {
  return Array.from({ length: ONE_TIME_CODE_LENGTH }, () => '')
}

/** The boxes filled with `code` when it is a well-formed code, otherwise empty. */
export function oneTimeCodeDigits(code: string | undefined): string[] {
  return code !== undefined && validateOneTimeCode(code) === null ? [...code] : emptyOneTimeCode()
}
