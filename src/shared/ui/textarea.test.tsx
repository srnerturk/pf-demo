import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('accepts multi-line text', async () => {
    render(<Textarea aria-label="Message" />)
    const textarea = screen.getByRole('textbox', { name: 'Message' })

    await userEvent.type(textarea, 'Hello{Enter}there')

    expect(textarea).toHaveValue('Hello\nthere')
  })
})
