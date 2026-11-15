import { describe, expect, it } from 'vitest'
import { toCsv } from './csv'

describe('toCsv', () => {
  it('writes one line per row, separated by commas', () => {
    expect(toCsv([['ID', 'Name'], ['1', 'Ada']])).toBe('﻿ID,Name\r\n1,Ada')
  })

  it('quotes values containing commas, quotes or line breaks', () => {
    expect(toCsv([['HR, FİNANS', 'say "hi"', 'two\nlines']])).toBe('﻿"HR, FİNANS","say ""hi""","two\nlines"')
  })

  it('neutralises values a spreadsheet would run as a formula', () => {
    expect(toCsv([['=SUM(A1)', '+1', '-2', '@x']])).toBe("﻿'=SUM(A1),'+1,'-2,'@x")
  })
})
