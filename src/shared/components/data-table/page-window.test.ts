import { describe, expect, it } from 'vitest'
import { pageWindow } from './page-window'

describe('pageWindow', () => {
  it('lists every page when there are only a few', () => {
    expect(pageWindow({ page: 2, pageCount: 5 })).toEqual([1, 2, 3, 4, 5])
  })

  it('keeps the first pages together near the start', () => {
    expect(pageWindow({ page: 1, pageCount: 12 })).toEqual([1, 2, 3, 4, 5, 'gap', 12])
  })

  it('shows the neighbours of a page in the middle, with gaps either side', () => {
    expect(pageWindow({ page: 6, pageCount: 12 })).toEqual([1, 'gap', 5, 6, 7, 'gap', 12])
  })

  it('keeps the last pages together near the end', () => {
    expect(pageWindow({ page: 12, pageCount: 12 })).toEqual([1, 'gap', 8, 9, 10, 11, 12])
  })

  it('never uses a gap to hide a single page', () => {
    expect(pageWindow({ page: 4, pageCount: 12 })).toEqual([1, 2, 3, 4, 5, 'gap', 12])
    expect(pageWindow({ page: 9, pageCount: 12 })).toEqual([1, 'gap', 8, 9, 10, 11, 12])
  })
})
