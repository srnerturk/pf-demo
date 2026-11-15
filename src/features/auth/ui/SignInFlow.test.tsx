import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ResendOneTimeCode } from '../application/resend-one-time-code'
import type { SignIn } from '../application/sign-in'
import type { VerifyOneTimeCode } from '../application/verify-one-time-code'
import { SignInFlow } from './SignInFlow'

function renderFlow() {
  const user = userEvent.setup()
  render(
    <SignInFlow
      signIn={vi.fn<SignIn>().mockResolvedValue({ id: 'challenge-1', email: 'ada@example.com' })}
      verifyOneTimeCode={vi.fn<VerifyOneTimeCode>().mockResolvedValue({ email: 'ada@example.com' })}
      resendOneTimeCode={vi.fn<ResendOneTimeCode>().mockResolvedValue(undefined)}
    />,
  )
  return { user }
}

async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email'), 'ada@example.com')
  await user.type(screen.getByLabelText('Password'), 'password123')
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
  await screen.findByRole('heading', { name: 'Check your email' })
}

describe('SignInFlow', () => {
  it('starts on the sign-in screen', () => {
    renderFlow()

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('moves from credentials to the one-time code to signed in', async () => {
    const { user } = renderFlow()

    await signIn(user)
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()

    await user.keyboard('123456')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    expect(await screen.findByRole('heading', { name: 'You’re signed in' })).toBeInTheDocument()
  })

  it('returns to an empty sign-in screen after signing out', async () => {
    const { user } = renderFlow()
    await signIn(user)
    await user.keyboard('123456')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    await user.click(await screen.findByRole('button', { name: 'Sign out' }))

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('')
  })

  it('goes back to the sign-in screen to use a different email', async () => {
    const { user } = renderFlow()
    await signIn(user)

    await user.click(screen.getByRole('button', { name: 'Use a different email' }))

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })
})
