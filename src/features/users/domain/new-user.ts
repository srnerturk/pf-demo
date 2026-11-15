import type { UserLanguage } from './user'

export interface PhoneNumber {
  /** International dialling prefix, e.g. `+90`. */
  countryCode: string
  nationalNumber: string
}

/** What the domain needs to know about a profile photo; its bytes travel alongside. */
export interface ProfilePhotoFacts {
  mediaType: string
  sizeBytes: number
}

/** A user as entered on the create form, before the system gives them an id. */
export interface NewUser {
  language: UserLanguage
  firstName: string
  lastName: string
  email: string
  phone: PhoneNumber
  userGroupId: string
  profilePhoto: ProfilePhotoFacts | null
}

export type NewUserViolation =
  | 'required'
  | 'invalid-email'
  | 'invalid-phone'
  | 'unsupported-photo-type'
  | 'photo-too-large'

export type NewUserViolations = Partial<Record<keyof NewUser, NewUserViolation>>

export const PROFILE_PHOTO_MEDIA_TYPES: readonly string[] = ['image/jpeg', 'image/png']
export const PROFILE_PHOTO_MAX_BYTES = 1024 * 1024

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TURKISH_COUNTRY_CODE = '+90'
const TURKISH_NATIONAL_NUMBER_LENGTH = 10
const NATIONAL_NUMBER_LENGTH = { min: 7, max: 14 }

export function validateRequired(value: string): NewUserViolation | null {
  return value.trim().length === 0 ? 'required' : null
}

export function validateEmail(email: string): NewUserViolation | null {
  return validateRequired(email) ?? (EMAIL_PATTERN.test(email.trim()) ? null : 'invalid-email')
}

/** A phone number is optional; when given it must be digits, ten of them for Turkey. */
export function validatePhone({ countryCode, nationalNumber }: PhoneNumber): NewUserViolation | null {
  const digits = nationalNumber.replace(/\s/g, '')
  if (digits.length === 0) return null
  if (!/^\d+$/.test(digits)) return 'invalid-phone'
  const fits =
    countryCode === TURKISH_COUNTRY_CODE
      ? digits.length === TURKISH_NATIONAL_NUMBER_LENGTH
      : digits.length >= NATIONAL_NUMBER_LENGTH.min && digits.length <= NATIONAL_NUMBER_LENGTH.max
  return fits ? null : 'invalid-phone'
}

export function validateProfilePhoto(photo: ProfilePhotoFacts | null): NewUserViolation | null {
  if (!photo) return null
  if (!PROFILE_PHOTO_MEDIA_TYPES.includes(photo.mediaType)) return 'unsupported-photo-type'
  return photo.sizeBytes > PROFILE_PHOTO_MAX_BYTES ? 'photo-too-large' : null
}

export function validateNewUser(newUser: NewUser): NewUserViolations {
  const checks: [keyof NewUser, NewUserViolation | null][] = [
    ['firstName', validateRequired(newUser.firstName)],
    ['lastName', validateRequired(newUser.lastName)],
    ['email', validateEmail(newUser.email)],
    ['phone', validatePhone(newUser.phone)],
    ['userGroupId', validateRequired(newUser.userGroupId)],
    ['profilePhoto', validateProfilePhoto(newUser.profilePhoto)],
  ]
  return Object.fromEntries(checks.filter(([, violation]) => violation !== null))
}
