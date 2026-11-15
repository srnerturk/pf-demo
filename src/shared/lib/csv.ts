const BYTE_ORDER_MARK = '﻿'
const NEEDS_QUOTES = /[",\r\n]/
const LOOKS_LIKE_FORMULA = /^[=+\-@]/

/**
 * Writes rows as CSV (RFC 4180). Starts with a byte order mark so spreadsheet apps read
 * Turkish letters correctly, and defuses values that would otherwise run as formulas.
 */
export function toCsv(rows: readonly (readonly string[])[]): string {
  return BYTE_ORDER_MARK + rows.map((row) => row.map(cell).join(',')).join('\r\n')
}

function cell(value: string): string {
  const safe = LOOKS_LIKE_FORMULA.test(value) ? `'${value}` : value
  return NEEDS_QUOTES.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}
