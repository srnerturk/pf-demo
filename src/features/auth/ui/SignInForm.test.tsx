import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CredentialsRejectedError, type SignIn } from '../application/sign-in'
import type { SignInChallenge } from '../domain/authentication'
import { SignInForm } from './SignInForm'

const challenge: SignInChallenge = { id: 'challenge-1', email: 'ada@example.com' }
const validInput = { email: 'ada@example.com', password: 'password123' }

function renderForm(signIn: SignIn = vi.fn<SignIn>().mockResolvedValue(challenge)) {
  const user = userEvent.setup()
  const onChallengeIssued = vi.fn<(challenge: SignInChallenge) => void>()
  render(<SignInForm signIn={signIn} onChallengeIssued={onChallengeIssued} />)
  return { user, signIn, onChallengeIssued }
}

async function fillIn(user: ReturnType<typeof userEvent.setup>, values: { email: string; password: string }) {
  if (values.email) await user.type(screen.getByLabelText('Email'), values.email)
  if (values.password) await user.type(screen.getByLabelText('Password'), values.password)
}

describe('SignInForm', () => {
  it('explains what is missing and signs in nobody when submitted empty', async () => {
    const { user, signIn } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(signIn).not.toHaveBeenCalled()
  })

  it('rejects a malformed email address and a short password', async () => {
    const { user, signIn } = renderForm()

    await fillIn(user, { email: 'ada@', password: 'short' })
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter a valid email address, like name@company.com.')).toBeInTheDocument()
    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('hides the password until asked to show it', async () => {
    const { user } = renderForm()
    const password = screen.getByLabelText('Password')

    expect(password).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it('hands over the challenge once the credentials are accepted', async () => {
    const { user, signIn, onChallengeIssued } = renderForm()

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await vi.waitFor(() => expect(onChallengeIssued).toHaveBeenCalledWith(challenge))
    expect(signIn).toHaveBeenCalledWith(validInput)
  })

  it('prevents double submission while signing in', async () => {
    let finish: (challenge: SignInChallenge) => void = () => {}
    const signIn = vi.fn<SignIn>(() => new Promise((resolve) => (finish = resolve)))
    const { user } = renderForm(signIn)

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('button', { name: 'Signing in…' })).toBeDisabled()
    finish(challenge)
  })

  it('says when the email and password do not match an account', async () => {
    const { user, onChallengeIssued } = renderForm(vi.fn<SignIn>().mockRejectedValue(new CredentialsRejectedError()))

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That email and password don’t match an account. Check them and try again.',
    )
    expect(screen.getByLabelText('Email')).toHaveValue(validInput.email)
    expect(onChallengeIssued).not.toHaveBeenCalled()
  })

  it('reports an unexpected failure separately from wrong credentials', async () => {
    const { user } = renderForm(vi.fn<SignIn>().mockRejectedValue(new Error('network down')))

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We couldn’t sign you in right now. Check your connection and try again.',
    )
  })
})
