import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { RequestCaptcha } from '../application/request-captcha'
import { CaptchaRejectedError, CredentialsRejectedError, type SignIn } from '../application/sign-in'
import type { SignInChallenge } from '../domain/authentication'
import type { Captcha } from '../domain/captcha'
import { SignInForm } from './SignInForm'

const challenge: SignInChallenge = { id: 'challenge-1', email: 'ada@example.com', remember: false }
const validInput = { email: 'ada@example.com', password: 'password123', captchaText: 'QZWL' }
const firstCaptcha: Captcha = { key: 'captcha-1', image: 'data:image/png;base64,first' }
const secondCaptcha: Captcha = { key: 'captcha-2', image: 'data:image/png;base64,second' }

/** Hands out the given captchas in order, repeating the last one. */
function captchasInOrder(...captchas: Captcha[]) {
  let next = 0
  return vi.fn<RequestCaptcha>(async () => captchas[Math.min(next++, captchas.length - 1)])
}

function renderForm({
  signIn = vi.fn<SignIn>().mockResolvedValue(challenge),
  requestCaptcha = captchasInOrder(firstCaptcha, secondCaptcha),
}: { signIn?: SignIn; requestCaptcha?: RequestCaptcha } = {}) {
  const user = userEvent.setup()
  const onChallengeIssued = vi.fn<(challenge: SignInChallenge) => void>()
  render(<SignInForm signIn={signIn} requestCaptcha={requestCaptcha} onChallengeIssued={onChallengeIssued} />)
  return { user, signIn, requestCaptcha, onChallengeIssued }
}

async function fillIn(
  user: ReturnType<typeof userEvent.setup>,
  values: { email: string; password: string; captchaText: string },
) {
  if (values.email) await user.type(screen.getByLabelText('Email'), values.email)
  if (values.password) await user.type(screen.getByLabelText('Password'), values.password)
  if (values.captchaText) await user.type(screen.getByLabelText('Security code'), values.captchaText)
}

const captchaPicture = () => screen.findByRole('img', { name: 'Security code to type' })

describe('SignInForm', () => {
  it('explains what is missing and signs in nobody when submitted empty', async () => {
    const { user, signIn } = renderForm()
    await captchaPicture()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(screen.getByText('Enter the characters in the picture.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(signIn).not.toHaveBeenCalled()
  })

  it('rejects a malformed email address', async () => {
    const { user, signIn } = renderForm()

    await fillIn(user, { ...validInput, email: 'ada@' })
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter a valid email address, like name@company.com.')).toBeInTheDocument()
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

  it('shows a captcha to answer', async () => {
    renderForm()

    expect(await captchaPicture()).toHaveAttribute('src', firstCaptcha.image)
  })

  it('shows a different captcha on request and clears the old answer', async () => {
    const { user } = renderForm()
    await captchaPicture()
    await user.type(screen.getByLabelText('Security code'), 'HARD')

    await user.click(screen.getByRole('button', { name: 'Show a new picture' }))

    await vi.waitFor(async () => expect(await captchaPicture()).toHaveAttribute('src', secondCaptcha.image))
    expect(screen.getByLabelText('Security code')).toHaveValue('')
  })

  it('says when the captcha cannot be loaded and lets the person try again', async () => {
    const requestCaptcha = vi.fn<RequestCaptcha>().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(firstCaptcha)
    const { user, signIn } = renderForm({ requestCaptcha })

    expect(await screen.findByText('We couldn’t load the picture.')).toBeInTheDocument()
    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Load a picture, then enter its characters.')).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Show a new picture' }))
    expect(await captchaPicture()).toHaveAttribute('src', firstCaptcha.image)
  })

  it('hands over the challenge once the credentials and captcha are accepted', async () => {
    const { user, signIn, onChallengeIssued } = renderForm()
    await captchaPicture()

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await vi.waitFor(() => expect(onChallengeIssued).toHaveBeenCalledWith(challenge))
    expect(signIn).toHaveBeenCalledWith({
      credentials: { email: validInput.email, password: validInput.password },
      captcha: { key: firstCaptcha.key, text: validInput.captchaText },
      remember: false,
    })
  })

  it('does not remember the person unless they ask to be remembered', async () => {
    renderForm()

    expect(screen.getByRole('checkbox', { name: 'Remember me' })).not.toBeChecked()
  })

  it('passes on the choice to be remembered', async () => {
    const { user, signIn } = renderForm()
    await captchaPicture()

    await fillIn(user, validInput)
    await user.click(screen.getByRole('checkbox', { name: 'Remember me' }))
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await vi.waitFor(() => expect(signIn).toHaveBeenCalledWith(expect.objectContaining({ remember: true })))
  })

  it('prevents double submission while signing in', async () => {
    let finish: (challenge: SignInChallenge) => void = () => {}
    const signIn = vi.fn<SignIn>(() => new Promise((resolve) => (finish = resolve)))
    const { user } = renderForm({ signIn })
    await captchaPicture()

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('button', { name: 'Signing in…' })).toBeDisabled()
    finish(challenge)
  })

  it('says when the email and password do not match an account, and offers a fresh captcha', async () => {
    const { user, onChallengeIssued } = renderForm({
      signIn: vi.fn<SignIn>().mockRejectedValue(new CredentialsRejectedError()),
    })
    await captchaPicture()

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That email and password don’t match an account. Check them and try again.',
    )
    expect(screen.getByLabelText('Email')).toHaveValue(validInput.email)
    await vi.waitFor(async () => expect(await captchaPicture()).toHaveAttribute('src', secondCaptcha.image))
    expect(screen.getByLabelText('Security code')).toHaveValue('')
    expect(onChallengeIssued).not.toHaveBeenCalled()
  })

  it('says when the security code is wrong, and offers a fresh captcha', async () => {
    const { user } = renderForm({ signIn: vi.fn<SignIn>().mockRejectedValue(new CaptchaRejectedError()) })
    await captchaPicture()

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The security code didn’t match the picture. Enter the characters in the new one.',
    )
    await vi.waitFor(async () => expect(await captchaPicture()).toHaveAttribute('src', secondCaptcha.image))
  })

  it('reports an unexpected failure separately from wrong credentials', async () => {
    const { user } = renderForm({ signIn: vi.fn<SignIn>().mockRejectedValue(new Error('network down')) })
    await captchaPicture()

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We couldn’t sign you in right now. Check your connection and try again.',
    )
  })
})
