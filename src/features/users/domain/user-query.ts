import type { User } from './user'

export type UserSortField = 'id' | 'name' | 'email' | 'status' | 'createdAt' | 'updatedAt'
export type SortDirection = 'asc' | 'desc'

export interface UserSort {
  field: UserSortField
  direction: SortDirection
}

export const PAGE_SIZES = [10, 25, 50] as const
export type PageSize = (typeof PAGE_SIZES)[number]

/** Which users to show: matching `search` (name or email), in `sort` order, one page at a time. */
export interface UserQuery {
  search: string
  sort: UserSort
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
  sort: { field: 'id', direction: 'desc' },
  page: 1,
  pageSize: 10,
}

export function pageCount({ total, pageSize }: { total: number; pageSize: number }): number {
  return Math.max(1, Math.ceil(total / pageSize))
}
