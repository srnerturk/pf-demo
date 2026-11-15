import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Alert, AlertDescription, AlertTitle } from './alert'

describe('Alert', () => {
  it('is announced to assistive technology with its title and description', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Sign-in failed</AlertTitle>
        <AlertDescription>Check your details and try again.</AlertDescription>
      </Alert>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Sign-in failed')
    expect(screen.getByRole('alert')).toHaveTextContent('Check your details and try again.')
  })
})
