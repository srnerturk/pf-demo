import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { ONE_TIME_CODE_LENGTH } from '../domain/one-time-code'
import { emptyOneTimeCode } from './one-time-code-digits'
import { OneTimeCodeInput } from './OneTimeCodeInput'

function ControlledOneTimeCodeInput() {
  const [digits, setDigits] = useState(emptyOneTimeCode())
  return <OneTimeCodeInput digits={digits} onChange={setDigits} />
}

function renderInput() {
  const user = userEvent.setup()
  render(<ControlledOneTimeCodeInput />)
  return { user }
}

const digitBox = (position: number) => screen.getByRole('textbox', { name: `Digit ${position} of ${ONE_TIME_CODE_LENGTH}` })

function enteredCode() {
  return screen
    .getAllByRole('textbox')
    .map((box) => (box as HTMLInputElement).value || '_')
    .join('')
}

describe('OneTimeCodeInput', () => {
  it('offers one box per digit', () => {
    renderInput()

    expect(screen.getAllByRole('textbox')).toHaveLength(ONE_TIME_CODE_LENGTH)
  })

  it('moves to the next box after each digit', async () => {
    const { user } = renderInput()

    await user.click(digitBox(1))
    await user.keyboard('12')

    expect(enteredCode()).toBe('12____')
    expect(digitBox(3)).toHaveFocus()
  })

  it('ignores anything that is not a digit', async () => {
    const { user } = renderInput()

    await user.click(digitBox(1))
    await user.keyboard('a')

    expect(enteredCode()).toBe('______')
    expect(digitBox(1)).toHaveFocus()
  })

  it('steps back and clears the previous digit when Backspace is pressed on an empty box', async () => {
    const { user } = renderInput()

    await user.click(digitBox(1))
    await user.keyboard('12{Backspace}')

    expect(enteredCode()).toBe('1_____')
    expect(digitBox(2)).toHaveFocus()
  })

  it('moves between boxes with the arrow keys', async () => {
    const { user } = renderInput()

    await user.click(digitBox(3))
    await user.keyboard('{ArrowLeft}')
    expect(digitBox(2)).toHaveFocus()

    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(digitBox(4)).toHaveFocus()
  })

  it('replaces a digit when a filled box is retyped', async () => {
    const { user } = renderInput()

    await user.click(digitBox(1))
    await user.keyboard('12{ArrowLeft}{ArrowLeft}9')

    expect(enteredCode()).toBe('92____')
  })

  it('fills every box from a pasted code, ignoring separators', async () => {
    const { user } = renderInput()

    await user.click(digitBox(1))
    await user.paste('123 456')

    expect(enteredCode()).toBe('123456')
    expect(digitBox(6)).toHaveFocus()
  })

  it('fills from the first box when a whole code is pasted into a later one', async () => {
    const { user } = renderInput()

    await user.click(digitBox(4))
    await user.paste('654321')

    expect(enteredCode()).toBe('654321')
  })

  it('fills from the current box when part of a code is pasted', async () => {
    const { user } = renderInput()

    await user.click(digitBox(3))
    await user.paste('78')

    expect(enteredCode()).toBe('__78__')
    expect(digitBox(5)).toHaveFocus()
  })
})
