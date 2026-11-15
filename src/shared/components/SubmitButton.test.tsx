import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubmitButton } from './SubmitButton'

describe('SubmitButton', () => {
  it('submits the form it belongs to', () => {
    render(<SubmitButton pending={false} pendingLabel="Saving…">Save</SubmitButton>)

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toBeEnabled()
  })

  it('says what is happening and blocks resubmission while pending', () => {
    render(<SubmitButton pending pendingLabel="Saving…">Save</SubmitButton>)

    const button = screen.getByRole('button', { name: 'Saving…' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })
})
