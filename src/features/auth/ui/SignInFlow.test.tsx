import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { RequestCaptcha } from '../application/request-captcha'
import type { ResendOneTimeCode } from '../application/resend-one-time-code'
import type { SignIn } from '../application/sign-in'
import type { VerifyOneTimeCode } from '../application/verify-one-time-code'
import type { Session } from '../domain/authentication'
import { SignInFlow } from './SignInFlow'

function renderFlow() {
  const user = userEvent.setup()
  const onSignedIn = vi.fn<(session: Session) => void>()
  render(
    <SignInFlow
      signIn={vi.fn<SignIn>().mockResolvedValue({ id: 'challenge-1', email: 'ada@example.com' })}
      requestCaptcha={vi.fn<RequestCaptcha>().mockResolvedValue({ key: 'captcha-1', image: 'data:image/png;base64,AAAA' })}
      verifyOneTimeCode={vi.fn<VerifyOneTimeCode>().mockResolvedValue({ email: 'ada@example.com' })}
      resendOneTimeCode={vi.fn<ResendOneTimeCode>().mockResolvedValue(undefined)}
      onSignedIn={onSignedIn}
    />,
  )
  return { user, onSignedIn }
}

async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email'), 'ada@example.com')
  await user.type(screen.getByLabelText('Password'), 'password123')
  await screen.findByRole('img', { name: 'Security code to type' })
  await user.type(screen.getByLabelText('Security code'), 'QZWL')
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
  await screen.findByRole('heading', { name: 'Check your email' })
}

describe('SignInFlow', () => {
  it('starts on the sign-in screen', () => {
    renderFlow()

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('moves from credentials to the one-time code, then hands over the session', async () => {
    const { user, onSignedIn } = renderFlow()

    await signIn(user)
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()

    await user.keyboard('123456')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith({ email: 'ada@example.com' }))
  })

  it('goes back to the sign-in screen to use a different email', async () => {
    const { user } = renderFlow()
    await signIn(user)

    await user.click(screen.getByRole('button', { name: 'Use a different email' }))

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })
})
