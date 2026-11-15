import { describe, expect, it } from 'vitest'
import { ONE_TIME_CODE_LENGTH, validateOneTimeCode } from './one-time-code'

describe('one-time code rules', () => {
  it('has six digits', () => {
    expect(ONE_TIME_CODE_LENGTH).toBe(6)
  })

  it('is required', () => {
    expect(validateOneTimeCode('')).toBe('required')
  })

  it('must contain only digits', () => {
    expect(validateOneTimeCode('12a456')).toBe('not-digits')
  })

  it('must not be shorter than six digits', () => {
    expect(validateOneTimeCode('12345')).toBe('wrong-length')
  })

  it('must not be longer than six digits', () => {
    expect(validateOneTimeCode('1234567')).toBe('wrong-length')
  })

  it('accepts exactly six digits', () => {
    expect(validateOneTimeCode('123456')).toBeNull()
  })
})
