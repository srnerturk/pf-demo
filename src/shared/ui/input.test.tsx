import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { Input } from './input'

describe('Input', () => {
  it('accepts typing and passes native attributes through', async () => {
    render(<Input aria-label="Email" type="email" aria-invalid />)
    const input = screen.getByRole('textbox', { name: 'Email' })

    await userEvent.type(input, 'ada@example.com')

    expect(input).toHaveValue('ada@example.com')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('exposes the underlying element through its ref', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} aria-label="Email" />)

    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Email' }))
  })
})
