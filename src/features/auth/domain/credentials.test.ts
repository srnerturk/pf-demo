import { describe, expect, it } from 'vitest'
import { PASSWORD_MIN_LENGTH, validateCredentials, validateEmail, validatePassword } from './credentials'

describe('credential rules', () => {
  describe('email', () => {
    it('is required', () => {
      expect(validateEmail('  ')).toBe('required')
    })

    it('must look like an email address', () => {
      expect(validateEmail('ada@example')).toBe('invalid-email')
    })

    it('accepts a well-formed address, ignoring surrounding whitespace', () => {
      expect(validateEmail(' ada@example.com ')).toBeNull()
    })
  })

  describe('password', () => {
    it('is required', () => {
      expect(validatePassword('')).toBe('required')
    })

    it(`must have at least ${PASSWORD_MIN_LENGTH} characters`, () => {
      expect(validatePassword('a'.repeat(PASSWORD_MIN_LENGTH - 1))).toBe('too-short')
    })

    it('counts whitespace as part of the password', () => {
      expect(validatePassword(' '.repeat(PASSWORD_MIN_LENGTH))).toBeNull()
    })
  })

  describe('credentials', () => {
    it('reports every violated field', () => {
      expect(validateCredentials({ email: 'nope', password: '' })).toEqual({
        email: 'invalid-email',
        password: 'required',
      })
    })

    it('reports nothing for valid credentials', () => {
      expect(validateCredentials({ email: 'ada@example.com', password: 'password123' })).toEqual({})
    })
  })
})
