import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('runs its click handler when pressed', async () => {
    const onClick = vi.fn<() => void>()
    render(<Button onClick={onClick}>Save</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('ignores clicks while disabled', async () => {
    const onClick = vi.fn<() => void>()
    render(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('lends its look to its child element instead of rendering a button', () => {
    render(
      <Button asChild>
        <a href="/help">Get help</a>
      </Button>,
    )

    expect(screen.getByRole('link', { name: 'Get help' })).toHaveAttribute('href', '/help')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
