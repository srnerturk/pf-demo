export type PageWindowItem = number | 'gap'

const SIBLINGS = 1
/** First page + gap + siblings either side of the current page + gap + last page. */
const SLOTS = 5 + SIBLINGS * 2

/**
 * Which page numbers to offer: always the first and last, the current page and its
 * neighbours, and a gap where pages are skipped, keeping the row the same width.
 */
export function pageWindow({ page, pageCount }: { page: number; pageCount: number }): PageWindowItem[] {
  if (pageCount <= SLOTS) return range(1, pageCount)

  const edgeRun = SLOTS - 2
  if (page <= edgeRun - SIBLINGS) return [...range(1, edgeRun), 'gap', pageCount]
  if (page >= pageCount - edgeRun + SIBLINGS + 1) return [1, 'gap', ...range(pageCount - edgeRun + 1, pageCount)]
  return [1, 'gap', ...range(page - SIBLINGS, page + SIBLINGS), 'gap', pageCount]
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}
