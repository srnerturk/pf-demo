import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SendContactMessage } from '../application/send-contact-message'
import { ContactForm } from './ContactForm'

function renderForm(sendContactMessage: SendContactMessage = vi.fn<SendContactMessage>().mockResolvedValue(undefined)) {
  const user = userEvent.setup()
  render(<ContactForm sendContactMessage={sendContactMessage} />)
  return { user, sendContactMessage }
}

async function fillIn(user: ReturnType<typeof userEvent.setup>, values: { name: string; email: string; message: string }) {
  await user.type(screen.getByLabelText('Name'), values.name)
  await user.type(screen.getByLabelText('Email'), values.email)
  await user.type(screen.getByLabelText('Message'), values.message)
}

const validInput = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hello from the analytical engine',
}

describe('ContactForm', () => {
  it('explains what is missing and sends nothing when submitted empty', async () => {
    const { user, sendContactMessage } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Please enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Please enter a message.')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
    expect(sendContactMessage).not.toHaveBeenCalled()
  })

  it('rejects a malformed email address', async () => {
    const { user, sendContactMessage } = renderForm()

    await fillIn(user, { ...validInput, email: 'ada@' })
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument()
    expect(sendContactMessage).not.toHaveBeenCalled()
  })

  it('rejects a message that is too short', async () => {
    const { user } = renderForm()

    await fillIn(user, { ...validInput, message: 'Hi' })
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Your message needs at least 10 characters.')).toBeInTheDocument()
  })

  it('sends the message, confirms it, and clears the form', async () => {
    const { user, sendContactMessage } = renderForm()

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Thanks! Your message has been sent.')
    expect(sendContactMessage).toHaveBeenCalledWith(validInput)
    expect(screen.getByLabelText('Name')).toHaveValue('')
  })

  it('prevents double submission while sending', async () => {
    let finishSending: () => void = () => {}
    const sendContactMessage = vi.fn<SendContactMessage>(
      () => new Promise<void>((resolve) => (finishSending = resolve)),
    )
    const { user } = renderForm(sendContactMessage)

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('button', { name: 'Sending…' })).toBeDisabled()
    finishSending()
    expect(await screen.findByRole('button', { name: 'Send message' })).toBeEnabled()
  })

  it('keeps the input and reports the problem when sending fails', async () => {
    const { user } = renderForm(vi.fn<SendContactMessage>().mockRejectedValue(new Error('service unavailable')))

    await fillIn(user, validInput)
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "We couldn't send your message. Please try again.",
    )
    expect(screen.getByLabelText('Name')).toHaveValue(validInput.name)
  })
})
