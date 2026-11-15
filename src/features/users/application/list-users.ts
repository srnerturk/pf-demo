import type { UserPage, UserQuery } from '../domain/user-query'

/** Port: finds users page by page. Implemented in infrastructure. */
export interface UserFinder {
  find(query: UserQuery): Promise<UserPage>
}

export type ListUsers = (query: UserQuery) => Promise<UserPage>

export function makeListUsers(finder: UserFinder): ListUsers {
  return (query) => finder.find(tidy(query))
}

export function tidy(query: UserQuery): UserQuery {
  return { ...query, search: query.search.trim(), page: Math.max(1, Math.floor(query.page)) }
}
