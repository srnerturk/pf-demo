import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ResendCode } from './ResendCode'

function renderResendCode(onResend = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)) {
  const user = userEvent.setup()
  render(<ResendCode onResend={onResend} cooldownSeconds={30} />)
  return { user, onResend }
}

async function waitSeconds(seconds: number) {
  await act(() => vi.advanceTimersByTimeAsync(seconds * 1000))
}

describe('ResendCode', () => {
  beforeEach(() => {
    // Only the clock the countdown reads is faked; React and user-event keep real timeouts.
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts down before a new code can be requested', async () => {
    renderResendCode()

    expect(screen.getByRole('button', { name: 'Resend code in 30s' })).toBeDisabled()

    await waitSeconds(12)
    expect(screen.getByRole('button', { name: 'Resend code in 18s' })).toBeDisabled()
  })

  it('allows a new code once the countdown ends', async () => {
    const { user, onResend } = renderResendCode()

    await waitSeconds(30)
    await user.click(screen.getByRole('button', { name: 'Resend code' }))

    expect(onResend).toHaveBeenCalledOnce()
  })

  it('confirms the new code and starts the countdown again', async () => {
    const { user } = renderResendCode()

    await waitSeconds(30)
    await user.click(screen.getByRole('button', { name: 'Resend code' }))

    expect(await screen.findByRole('status')).toHaveTextContent('We sent you a new code.')
    expect(screen.getByRole('button', { name: 'Resend code in 30s' })).toBeDisabled()
  })

  it('cannot be pressed twice while a code is being sent', async () => {
    let finish: () => void = () => {}
    const { user } = renderResendCode(vi.fn(() => new Promise<void>((resolve) => (finish = resolve))))

    await waitSeconds(30)
    await user.click(screen.getByRole('button', { name: 'Resend code' }))

    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled()
    await act(async () => finish())
  })

  it('reports a failed resend and allows another try straight away', async () => {
    const { user } = renderResendCode(vi.fn<() => Promise<void>>().mockRejectedValue(new Error('down')))

    await waitSeconds(30)
    await user.click(screen.getByRole('button', { name: 'Resend code' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t send a new code. Try again.')
    expect(screen.getByRole('button', { name: 'Resend code' })).toBeEnabled()
  })
})
