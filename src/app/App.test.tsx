import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeResendOneTimeCode } from '@/features/auth/application/resend-one-time-code'
import { makeSignIn } from '@/features/auth/application/sign-in'
import { makeVerifyOneTimeCode } from '@/features/auth/application/verify-one-time-code'
import { InMemoryAuthenticator } from '@/features/auth/infrastructure/in-memory-authenticator'
import { WebStorageSessionStore } from '@/features/auth/infrastructure/web-storage-session-store'
import { App } from './App'

const account = { email: 'ada@example.com', password: 'password123', oneTimeCode: '123456' }

function CurrentPath() {
  return <output aria-label="Current path">{useLocation().pathname}</output>
}

function renderApp({ at = '/', signedInAs }: { at?: string; signedInAs?: string } = {}) {
  const user = userEvent.setup()
  const authenticator = new InMemoryAuthenticator({ account })
  const sessionStore = new WebStorageSessionStore(window.localStorage)
  if (signedInAs) sessionStore.save({ email: signedInAs })

  render(
    <MemoryRouter initialEntries={[at]}>
      <App
        signIn={makeSignIn(authenticator)}
        verifyOneTimeCode={makeVerifyOneTimeCode(authenticator)}
        resendOneTimeCode={makeResendOneTimeCode(authenticator)}
        sessionStore={sessionStore}
        footnote="Demo account details"
      />
      <CurrentPath />
    </MemoryRouter>,
  )
  return { user, sessionStore }
}

const currentPath = () => screen.getByRole('status', { name: 'Current path' })

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('sends a signed-out visitor to the sign-in page', () => {
    renderApp({ at: '/' })

    expect(currentPath()).toHaveTextContent('/auth/login')
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('sends a signed-out visitor from an unknown address to the sign-in page', () => {
    renderApp({ at: '/does-not-exist' })

    expect(currentPath()).toHaveTextContent('/auth/login')
  })

  it('signs a person in with their password and emailed code, opens the dashboard, and signs out again', async () => {
    const { user, sessionStore } = renderApp({ at: '/auth/login' })

    await user.type(screen.getByLabelText('Email'), account.email)
    await user.type(screen.getByLabelText('Password'), account.password)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await screen.findByRole('heading', { name: 'Check your email' })
    await user.keyboard('000000')
    await user.click(screen.getByRole('button', { name: 'Verify' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('That code isn’t right.')

    await user.keyboard(account.oneTimeCode)
    await user.click(screen.getByRole('button', { name: 'Verify' }))
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(currentPath()).toHaveTextContent(/^\/$/)
    expect(within(screen.getByRole('banner')).getByText(account.email)).toBeInTheDocument()
    expect(sessionStore.load()).toEqual({ email: account.email })

    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(currentPath()).toHaveTextContent('/auth/login')
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(sessionStore.load()).toBeNull()
  })

  it('refuses a wrong password', async () => {
    const { user } = renderApp({ at: '/auth/login' })

    await user.type(screen.getByLabelText('Email'), account.email)
    await user.type(screen.getByLabelText('Password'), 'not-the-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('That email and password don’t match an account.')
  })

  it('opens the dashboard for a session remembered from an earlier visit', () => {
    renderApp({ at: '/', signedInAs: account.email })

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(within(screen.getByRole('banner')).getByText(account.email)).toBeInTheDocument()
  })

  it('sends a signed-in person away from the sign-in page to the dashboard', () => {
    renderApp({ at: '/auth/login', signedInAs: account.email })

    expect(currentPath()).toHaveTextContent(/^\/$/)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('shows the footnote below the sign-in flow', () => {
    renderApp({ at: '/auth/login' })

    expect(screen.getByText('Demo account details')).toBeInTheDocument()
  })
})
