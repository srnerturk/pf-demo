import type { CountryCode } from '@/shared/components/PhoneField'

/** Dialling codes offered on the create form; Turkey first, as most users are there. */
export const countryCodes: readonly CountryCode[] = [
  { code: '+90', country: 'TR' },
  { code: '+49', country: 'DE' },
  { code: '+44', country: 'GB' },
  { code: '+31', country: 'NL' },
  { code: '+1', country: 'US' },
]
