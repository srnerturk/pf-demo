import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './label'

describe('Label', () => {
  it('names the control it points at', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    )

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  })
})
