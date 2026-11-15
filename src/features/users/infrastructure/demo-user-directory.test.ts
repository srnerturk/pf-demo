import { describe, expect, it } from 'vitest'
import { demoUserGroups, demoUsers } from './demo-user-directory'

describe('demo user directory', () => {
  it('seeds 119 users with unique ids and emails', () => {
    expect(demoUsers).toHaveLength(119)
    expect(new Set(demoUsers.map((user) => user.id)).size).toBe(119)
    expect(new Set(demoUsers.map((user) => user.email)).size).toBe(119)
  })

  it('gives every user the roles of one of the demo groups', () => {
    const roleSets = demoUserGroups.map((group) => group.roles.join())

    expect(demoUsers.every((user) => roleSets.includes(user.roles.join()))).toBe(true)
  })

  it('includes some inactive users', () => {
    expect(demoUsers.some((user) => user.status === 'passive')).toBe(true)
  })
})
