import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_USER_QUERY, type UserPage } from '../domain/user-query'
import { makeListUsers, type UserFinder } from './list-users'

const emptyPage: UserPage = { users: [], total: 0 }

describe('listUsers', () => {
  it('asks for the users matching a tidied query', async () => {
    const finder: UserFinder = { find: vi.fn<UserFinder['find']>().mockResolvedValue(emptyPage) }

    await makeListUsers(finder)({ ...DEFAULT_USER_QUERY, search: '  ada  ', page: 0 })

    expect(finder.find).toHaveBeenCalledWith({ ...DEFAULT_USER_QUERY, search: 'ada', page: 1 })
  })

  it('returns the page it finds', async () => {
    const page: UserPage = { users: [], total: 42 }

    await expect(makeListUsers({ find: async () => page })(DEFAULT_USER_QUERY)).resolves.toBe(page)
  })
})
