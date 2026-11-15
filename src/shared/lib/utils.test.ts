import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('joins class names and skips falsy ones', () => {
    expect(cn('px-4', false, undefined, null, 'font-medium')).toBe('px-4 font-medium')
  })

  it('lets a later Tailwind utility override a conflicting earlier one', () => {
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6')
  })
})
