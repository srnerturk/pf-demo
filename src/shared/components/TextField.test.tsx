import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { TextField } from './TextField'

describe('TextField', () => {
  it('is a labelled text input that passes native attributes and its ref through', async () => {
    const ref = createRef<HTMLInputElement>()
    render(<TextField id="email" label="E-posta" type="email" placeholder="ornek@sirket.com" ref={ref} />)
    const input = screen.getByRole('textbox', { name: 'E-posta' })

    await userEvent.type(input, 'ada@example.com')

    expect(input).toHaveValue('ada@example.com')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'ornek@sirket.com')
    expect(ref.current).toBe(input)
  })

  it('shows its error and marks the input invalid', () => {
    render(<TextField id="email" label="E-posta" error="Geçerli bir e-posta adresi girin." />)

    const input = screen.getByRole('textbox', { name: 'E-posta' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Geçerli bir e-posta adresi girin.')
  })
})
