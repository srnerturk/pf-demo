import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { makeResendOneTimeCode } from '@/features/auth/application/resend-one-time-code'
import { makeSignIn } from '@/features/auth/application/sign-in'
import { makeVerifyOneTimeCode } from '@/features/auth/application/verify-one-time-code'
import { InMemoryAuthenticator } from '@/features/auth/infrastructure/in-memory-authenticator'
import { App } from './App'

const account = { email: 'ada@example.com', password: 'password123', oneTimeCode: '123456' }

function renderApp() {
  const user = userEvent.setup()
  const authenticator = new InMemoryAuthenticator({ account })
  render(
    <App
      signIn={makeSignIn(authenticator)}
      verifyOneTimeCode={makeVerifyOneTimeCode(authenticator)}
      resendOneTimeCode={makeResendOneTimeCode(authenticator)}
      footnote="Demo account details"
    />,
  )
  return { user }
}

describe('App', () => {
  it('signs a person in with their password and emailed code, and out again', async () => {
    const { user } = renderApp()

    await user.type(screen.getByLabelText('Email'), account.email)
    await user.type(screen.getByLabelText('Password'), account.password)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await screen.findByRole('heading', { name: 'Check your email' })
    await user.keyboard('000000')
    await user.click(screen.getByRole('button', { name: 'Verify' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('That code isn’t right.')

    await user.keyboard(account.oneTimeCode)
    await user.click(screen.getByRole('button', { name: 'Verify' }))
    expect(await screen.findByRole('heading', { name: 'You’re signed in' })).toBeInTheDocument()
    expect(screen.getByText(account.email)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('refuses a wrong password', async () => {
    const { user } = renderApp()

    await user.type(screen.getByLabelText('Email'), account.email)
    await user.type(screen.getByLabelText('Password'), 'not-the-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('That email and password don’t match an account.')
  })

  it('shows the footnote below the flow', () => {
    renderApp()

    expect(screen.getByText('Demo account details')).toBeInTheDocument()
  })
})
