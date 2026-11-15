import { describe, expect, it } from 'vitest'
import {
  MESSAGE_MIN_LENGTH,
  validateContactMessage,
  validateEmail,
  validateMessage,
  validateName,
} from './contact-message'

describe('contact message rules', () => {
  describe('name', () => {
    it('is required', () => {
      expect(validateName('   ')).toBe('required')
    })

    it('accepts any non-blank name', () => {
      expect(validateName('Ada Lovelace')).toBeNull()
    })
  })

  describe('email', () => {
    it('is required', () => {
      expect(validateEmail('')).toBe('required')
    })

    it('must look like an email address', () => {
      expect(validateEmail('ada@')).toBe('invalid-email')
    })

    it('accepts a well-formed address', () => {
      expect(validateEmail('ada@example.com')).toBeNull()
    })
  })

  describe('message', () => {
    it('is required', () => {
      expect(validateMessage('')).toBe('required')
    })

    it(`must have at least ${MESSAGE_MIN_LENGTH} meaningful characters`, () => {
      expect(validateMessage(`  ${'a'.repeat(MESSAGE_MIN_LENGTH - 1)}  `)).toBe('too-short')
    })

    it('accepts a long enough message', () => {
      expect(validateMessage('a'.repeat(MESSAGE_MIN_LENGTH))).toBeNull()
    })
  })

  describe('whole message', () => {
    it('reports every violated field', () => {
      expect(validateContactMessage({ name: '', email: 'nope', message: 'hi' })).toEqual({
        name: 'required',
        email: 'invalid-email',
        message: 'too-short',
      })
    })

    it('reports nothing for a valid message', () => {
      expect(
        validateContactMessage({
          name: 'Ada',
          email: 'ada@example.com',
          message: 'Hello from the analytical engine',
        }),
      ).toEqual({})
    })
  })
})
