import { describe, expect, it } from 'vitest'
import type { User } from '../domain/user'
import type { UserQuery } from '../domain/user-query'
import { makeExportUsers } from './export-users'
import type { UserFinder } from './list-users'

const users: User[] = Array.from({ length: 120 }, (_, index) => ({
  id: index + 1,
  firstName: `First${index + 1}`,
  lastName: 'Last',
  email: `user${index + 1}@example.com`,
  status: 'active',
  roles: [],
  createdAt: new Date(0),
  updatedAt: new Date(0),
}))

class PagedFinder implements UserFinder {
  readonly queries: UserQuery[] = []

  async find(query: UserQuery) {
    this.queries.push(query)
    const start = (query.page - 1) * query.pageSize
    return { users: users.slice(start, start + query.pageSize), total: users.length }
  }
}

describe('exportUsers', () => {
  it('collects every matching user across pages, keeping the search and order', async () => {
    const finder = new PagedFinder()

    const exported = await makeExportUsers(finder)({ search: ' first ', sort: { field: 'name', direction: 'asc' } })

    expect(exported).toEqual(users)
    expect(finder.queries.every((query) => query.search === 'first' && query.sort.field === 'name')).toBe(true)
  })
})
