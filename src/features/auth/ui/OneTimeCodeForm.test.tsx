import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ResendOneTimeCode } from '../application/resend-one-time-code'
import { OneTimeCodeRejectedError, type VerifyOneTimeCode } from '../application/verify-one-time-code'
import type { Session, SignInChallenge } from '../domain/authentication'
import { OneTimeCodeForm } from './OneTimeCodeForm'

const challenge: SignInChallenge = { id: 'challenge-1', email: 'ada@example.com' }
const session: Session = { email: 'ada@example.com' }

interface Overrides {
  verifyOneTimeCode?: VerifyOneTimeCode
  resendOneTimeCode?: ResendOneTimeCode
  resendCooldownSeconds?: number
}

function renderForm({
  verifyOneTimeCode = vi.fn<VerifyOneTimeCode>().mockResolvedValue(session),
  resendOneTimeCode = vi.fn<ResendOneTimeCode>().mockResolvedValue(undefined),
  resendCooldownSeconds = 30,
}: Overrides = {}) {
  const user = userEvent.setup()
  const onVerified = vi.fn<(session: Session) => void>()
  const onChangeEmail = vi.fn<() => void>()
  render(
    <OneTimeCodeForm
      challenge={challenge}
      verifyOneTimeCode={verifyOneTimeCode}
      resendOneTimeCode={resendOneTimeCode}
      resendCooldownSeconds={resendCooldownSeconds}
      onVerified={onVerified}
      onChangeEmail={onChangeEmail}
    />,
  )
  return { user, verifyOneTimeCode, resendOneTimeCode, onVerified, onChangeEmail }
}

const firstDigit = () => screen.getByRole('textbox', { name: 'Digit 1 of 6' })

describe('OneTimeCodeForm', () => {
  it('says where the code was sent and is ready for the first digit', () => {
    renderForm()

    expect(screen.getByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(firstDigit()).toHaveFocus()
  })

  it('asks for the code when Verify is pressed with nothing entered', async () => {
    const { user, verifyOneTimeCode } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Verify' }))

    expect(await screen.findByText('Enter the 6-digit code from your email.')).toBeInTheDocument()
    expect(firstDigit()).toHaveAttribute('aria-invalid', 'true')
    expect(verifyOneTimeCode).not.toHaveBeenCalled()
  })

  it('asks for every digit when the code is incomplete', async () => {
    const { user, verifyOneTimeCode } = renderForm()

    await user.keyboard('123')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    expect(await screen.findByText('Enter all 6 digits.')).toBeInTheDocument()
    expect(verifyOneTimeCode).not.toHaveBeenCalled()
  })

  it('verifies the code and hands over the session', async () => {
    const { user, verifyOneTimeCode, onVerified } = renderForm()

    await user.keyboard('123456')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    await vi.waitFor(() => expect(onVerified).toHaveBeenCalledWith(session))
    expect(verifyOneTimeCode).toHaveBeenCalledWith(challenge, '123456')
  })

  it('prevents double submission while verifying', async () => {
    let finish: (session: Session) => void = () => {}
    const { user } = renderForm({
      verifyOneTimeCode: vi.fn<VerifyOneTimeCode>(() => new Promise((resolve) => (finish = resolve))),
    })

    await user.keyboard('123456')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    expect(await screen.findByRole('button', { name: 'Verifying…' })).toBeDisabled()
    finish(session)
  })

  it('clears a wrong code and returns to the first digit', async () => {
    const { user, onVerified } = renderForm({
      verifyOneTimeCode: vi.fn<VerifyOneTimeCode>().mockRejectedValue(new OneTimeCodeRejectedError()),
    })

    await user.keyboard('000000')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('That code isn’t right. Check your email and try again.')
    expect(firstDigit()).toHaveValue('')
    expect(firstDigit()).toHaveFocus()
    expect(onVerified).not.toHaveBeenCalled()
  })

  it('keeps the code when verification fails unexpectedly', async () => {
    const { user } = renderForm({
      verifyOneTimeCode: vi.fn<VerifyOneTimeCode>().mockRejectedValue(new Error('network down')),
    })

    await user.keyboard('123456')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We couldn’t verify the code right now. Check your connection and try again.',
    )
    expect(firstDigit()).toHaveValue('1')
  })

  it('sends a new code for the same challenge once the countdown allows it', async () => {
    const { user, resendOneTimeCode } = renderForm({ resendCooldownSeconds: 0 })

    await user.click(screen.getByRole('button', { name: 'Resend code' }))

    expect(resendOneTimeCode).toHaveBeenCalledWith(challenge)
  })

  it('lets the person go back and use a different email', async () => {
    const { user, onChangeEmail } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Use a different email' }))

    expect(onChangeEmail).toHaveBeenCalledOnce()
  })
})
