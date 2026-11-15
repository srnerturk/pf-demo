import { describe, expect, it } from 'vitest'
import {
  PROFILE_PHOTO_MAX_BYTES,
  validateEmail,
  validateNewUser,
  validatePhone,
  validateProfilePhoto,
  validateRequired,
  type NewUser,
} from './new-user'

const validNewUser: NewUser = {
  language: 'tr',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: { countryCode: '+90', nationalNumber: '5321234567' },
  userGroupId: 'finance',
  profilePhoto: null,
}

describe('validateRequired', () => {
  it('rejects blank text', () => {
    expect(validateRequired('   ')).toBe('required')
    expect(validateRequired('Ada')).toBeNull()
  })
})

describe('validateEmail', () => {
  it('needs an address in name@domain.tld form', () => {
    expect(validateEmail('')).toBe('required')
    expect(validateEmail('ada@')).toBe('invalid-email')
    expect(validateEmail(' ada@example.com ')).toBeNull()
  })
})

describe('validatePhone', () => {
  it('is optional', () => {
    expect(validatePhone({ countryCode: '+90', nationalNumber: '  ' })).toBeNull()
  })

  it('needs ten digits for a Turkish number, ignoring spaces', () => {
    expect(validatePhone({ countryCode: '+90', nationalNumber: '532 123 45 67' })).toBeNull()
    expect(validatePhone({ countryCode: '+90', nationalNumber: '532 123' })).toBe('invalid-phone')
  })

  it('needs 7 to 14 digits for other countries', () => {
    expect(validatePhone({ countryCode: '+49', nationalNumber: '301234567' })).toBeNull()
    expect(validatePhone({ countryCode: '+49', nationalNumber: '12345' })).toBe('invalid-phone')
  })

  it('accepts digits only', () => {
    expect(validatePhone({ countryCode: '+90', nationalNumber: '53212345ab' })).toBe('invalid-phone')
  })
})

describe('validateProfilePhoto', () => {
  it('is optional', () => {
    expect(validateProfilePhoto(null)).toBeNull()
  })

  it('accepts JPEG and PNG up to the size limit', () => {
    expect(validateProfilePhoto({ mediaType: 'image/jpeg', sizeBytes: PROFILE_PHOTO_MAX_BYTES })).toBeNull()
    expect(validateProfilePhoto({ mediaType: 'image/png', sizeBytes: 10 })).toBeNull()
  })

  it('refuses other file types', () => {
    expect(validateProfilePhoto({ mediaType: 'image/gif', sizeBytes: 10 })).toBe('unsupported-photo-type')
  })

  it('refuses a photo over the size limit', () => {
    expect(validateProfilePhoto({ mediaType: 'image/png', sizeBytes: PROFILE_PHOTO_MAX_BYTES + 1 })).toBe('photo-too-large')
  })
})

describe('validateNewUser', () => {
  it('finds nothing wrong with a complete user', () => {
    expect(validateNewUser(validNewUser)).toEqual({})
  })

  it('reports every problem by field', () => {
    expect(
      validateNewUser({
        ...validNewUser,
        firstName: '',
        lastName: ' ',
        email: 'nope',
        userGroupId: '',
        phone: { countryCode: '+90', nationalNumber: '1' },
        profilePhoto: { mediaType: 'application/pdf', sizeBytes: 1 },
      }),
    ).toEqual({
      firstName: 'required',
      lastName: 'required',
      email: 'invalid-email',
      userGroupId: 'required',
      phone: 'invalid-phone',
      profilePhoto: 'unsupported-photo-type',
    })
  })
})
