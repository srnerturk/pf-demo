import { describe, expect, it } from 'vitest'
import { pageCount } from './user-query'

describe('pageCount', () => {
  it('rounds up so the last partial page counts', () => {
    expect(pageCount({ total: 119, pageSize: 10 })).toBe(12)
    expect(pageCount({ total: 120, pageSize: 10 })).toBe(12)
  })

  it('has one page even when there is nothing to show', () => {
    expect(pageCount({ total: 0, pageSize: 10 })).toBe(1)
  })
})
