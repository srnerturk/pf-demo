import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { ONE_TIME_CODE_LENGTH } from '../domain/one-time-code'
import { emptyOneTimeCode } from './one-time-code-digits'

const POSITIONS = emptyOneTimeCode().map((_, index) => index)

const digitBoxClassName =
  'h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white text-center text-xl font-semibold tabular-nums ' +
  'text-slate-900 shadow-sm caret-indigo-600 transition-colors sm:h-14 sm:text-2xl ' +
  'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none ' +
  'disabled:bg-slate-50 disabled:text-slate-400 ' +
  'aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/30'

interface OneTimeCodeInputProps {
  digits: readonly string[]
  onChange: (digits: string[]) => void
  invalid?: boolean
  disabled?: boolean
  focusFirstOnMount?: boolean
  'aria-describedby'?: string
}

/** One box per digit. Focus follows typing, Backspace and arrow keys; a pasted code fills the boxes. */
export function OneTimeCodeInput({
  digits,
  onChange,
  invalid,
  disabled,
  focusFirstOnMount = false,
  'aria-describedby': describedBy,
}: OneTimeCodeInputProps) {
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (focusFirstOnMount) boxes.current[0]?.focus()
  }, [focusFirstOnMount])

  function focusBox(index: number) {
    const box = boxes.current[Math.min(Math.max(index, 0), ONE_TIME_CODE_LENGTH - 1)]
    box?.focus()
    box?.select()
  }

  function setDigit(index: number, digit: string) {
    const next = [...digits]
    next[index] = digit
    onChange(next)
  }

  /** Writes incoming digits starting at `index`. A complete code always starts at the first box. */
  function fillFrom(index: number, text: string) {
    const incoming = text.replace(/\D/g, '')
    if (incoming.length === 0) return

    const start = incoming.length >= ONE_TIME_CODE_LENGTH ? 0 : index
    const written = incoming.slice(0, ONE_TIME_CODE_LENGTH - start)
    const next = [...digits]
    for (const [offset, digit] of [...written].entries()) next[start + offset] = digit
    onChange(next)
    focusBox(start + written.length)
  }

  function handleInput(index: number, value: string) {
    if (value === '') {
      setDigit(index, '')
      return
    }
    fillFrom(index, value)
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && digits[index] === '' && index > 0) {
      event.preventDefault()
      setDigit(index - 1, '')
      focusBox(index - 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusBox(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    fillFrom(index, event.clipboardData.getData('text'))
  }

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-3">
      {POSITIONS.map((index) => (
        <input
          key={index}
          ref={(box) => {
            boxes.current[index] = box
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1} of ${ONE_TIME_CODE_LENGTH}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          value={digits[index]}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={digitBoxClassName}
        />
      ))}
    </div>
  )
}
