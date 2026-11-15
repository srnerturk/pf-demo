import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { makeSendContactMessage } from '@/features/contact/application/send-contact-message'
import { InMemoryContactMessageSender } from '@/features/contact/infrastructure/in-memory-contact-message-sender'
import { App } from './App'

describe('App', () => {
  it('delivers a contact message from the page to the sender', async () => {
    const user = userEvent.setup()
    const sender = new InMemoryContactMessageSender()
    render(<App sendContactMessage={makeSendContactMessage(sender)} />)

    expect(screen.getByRole('heading', { name: 'Get in touch' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Message'), 'Hello from the analytical engine')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('status')).toBeInTheDocument()
    expect(sender.sent).toEqual([
      { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello from the analytical engine' },
    ])
  })
})
