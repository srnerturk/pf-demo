import type { User } from '../domain/user'
import { pageCount, PAGE_SIZES, type UserQuery } from '../domain/user-query'
import { tidy, type UserFinder } from './list-users'

export type ExportUsers = (criteria: Pick<UserQuery, 'search' | 'sort'>) => Promise<User[]>

const EXPORT_PAGE_SIZE = PAGE_SIZES[PAGE_SIZES.length - 1]

/** Every user matching the search, in the chosen order, gathered across as many pages as it takes. */
export function makeExportUsers(finder: UserFinder): ExportUsers {
  return async ({ search, sort }) => {
    const queryFor = (page: number) => tidy({ search, sort, page, pageSize: EXPORT_PAGE_SIZE })
    const first = await finder.find(queryFor(1))
    const pages = pageCount({ total: first.total, pageSize: EXPORT_PAGE_SIZE })
    const rest = await Promise.all(Array.from({ length: pages - 1 }, (_, index) => finder.find(queryFor(index + 2))))
    return [first, ...rest].flatMap((page) => page.users)
  }
}
