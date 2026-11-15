import type { User } from './user'

export const PAGE_SIZES = [10, 25, 50] as const
export type PageSize = (typeof PAGE_SIZES)[number]

/** Which users to show: matching `search` (name or email), one page at a time, in the order the directory keeps them. */
export interface UserQuery {
  search: string
  /** 1-based. */
  page: number
  pageSize: PageSize
}

/** One page of the users matching a query, and how many match in total. */
export interface UserPage {
  users: readonly User[]
  total: number
}

export const DEFAULT_USER_QUERY: UserQuery = {
  search: '',
  page: 1,
  pageSize: 10,
}

export function pageCount({ total, pageSize }: { total: number; pageSize: number }): number {
  return Math.max(1, Math.ceil(total / pageSize))
}
