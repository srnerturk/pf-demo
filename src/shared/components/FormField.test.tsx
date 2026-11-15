import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('names its control with the label', () => {
    render(<FormField id="email" label="Email">{(controlProps) => <input {...controlProps} />}</FormField>)

    const control = screen.getByRole('textbox', { name: 'Email' })
    expect(control).not.toHaveAttribute('aria-invalid')
    expect(control).not.toHaveAccessibleDescription()
  })

  it('marks the control invalid and describes it with the error', () => {
    render(
      <FormField id="email" label="Email" error="Enter your email address.">
        {(controlProps) => <input {...controlProps} />}
      </FormField>,
    )

    const control = screen.getByRole('textbox', { name: 'Email' })
    expect(control).toHaveAttribute('aria-invalid', 'true')
    expect(control).toHaveAccessibleDescription('Enter your email address.')
  })

  it('describes the control with a hint until there is an error', () => {
    const { rerender } = render(
      <FormField id="photo" label="Photo" hint="JPEG or PNG">
        {(controlProps) => <input {...controlProps} />}
      </FormField>,
    )
    expect(screen.getByRole('textbox', { name: 'Photo' })).toHaveAccessibleDescription('JPEG or PNG')

    rerender(
      <FormField id="photo" label="Photo" hint="JPEG or PNG" error="Too large.">
        {(controlProps) => <input {...controlProps} />}
      </FormField>,
    )
    expect(screen.getByRole('textbox', { name: 'Photo' })).toHaveAccessibleDescription('Too large.')
    expect(screen.queryByText('JPEG or PNG')).not.toBeInTheDocument()
  })
})
