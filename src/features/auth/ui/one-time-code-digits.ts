import { ONE_TIME_CODE_LENGTH } from '../domain/one-time-code'

/** The code as the input edits it: one entry per box, `''` for an empty box. */
export function emptyOneTimeCode(): string[] {
  return Array.from({ length: ONE_TIME_CODE_LENGTH }, () => '')
}
