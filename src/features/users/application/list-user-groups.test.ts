import { describe, expect, it } from 'vitest'
import { makeListUserGroups } from './list-user-groups'

describe('listUserGroups', () => {
  it('offers the groups the catalog knows', async () => {
    const groups = [{ id: 'finance', name: 'Finans' }]

    await expect(makeListUserGroups({ list: async () => groups })()).resolves.toBe(groups)
  })
})
