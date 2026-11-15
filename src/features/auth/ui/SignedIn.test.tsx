import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SignedIn } from './SignedIn'

describe('SignedIn', () => {
  it('confirms who is signed in and moves focus to the confirmation', () => {
    render(<SignedIn session={{ email: 'ada@example.com' }} onSignOut={() => {}} />)

    expect(screen.getByRole('heading', { name: 'You’re signed in' })).toHaveFocus()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })

  it('signs out on request', async () => {
    const user = userEvent.setup()
    const onSignOut = vi.fn<() => void>()
    render(<SignedIn session={{ email: 'ada@example.com' }} onSignOut={onSignOut} />)

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(onSignOut).toHaveBeenCalledOnce()
  })
})
