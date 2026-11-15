import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

describe('Card', () => {
  it('renders its sections in order', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Billed monthly</CardDescription>
        </CardHeader>
        <CardContent>Pro</CardContent>
        <CardFooter>Change plan</CardFooter>
      </Card>,
    )

    expect(screen.getByTestId('card')).toHaveTextContent('PlanBilled monthlyProChange plan')
  })
})
