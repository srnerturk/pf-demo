import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { TestI18nProvider } from '@/test/i18n'
import { PhoneField, type PhoneValue } from './PhoneField'

const countryCodes = [
  { code: '+90', country: 'TR' },
  { code: '+49', country: 'DE' },
]

function Harness({ error }: { error?: string }) {
  const [value, setValue] = useState<PhoneValue>({ countryCode: '+90', nationalNumber: '' })
  return (
    <TestI18nProvider>
      <PhoneField id="phone" label="Telefon" countryCodes={countryCodes} value={value} onChange={setValue} error={error} />
      <output aria-label="Value">{`${value.countryCode} ${value.nationalNumber}`}</output>
    </TestI18nProvider>
  )
}

describe('PhoneField', () => {
  it('takes a country code and a number', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('combobox', { name: 'Ülke kodu' }))
    await user.click(screen.getByRole('option', { name: /\+49/ }))
    await user.type(screen.getByRole('textbox', { name: 'Telefon' }), '301234567')

    expect(screen.getByRole('status', { name: 'Value' })).toHaveTextContent('+49 301234567')
  })

  it('shows its error and marks the number invalid', () => {
    render(<Harness error="Geçerli bir telefon numarası girin." />)

    const number = screen.getByRole('textbox', { name: 'Telefon' })
    expect(number).toHaveAttribute('aria-invalid', 'true')
    expect(number).toHaveAccessibleDescription('Geçerli bir telefon numarası girin.')
  })
})
