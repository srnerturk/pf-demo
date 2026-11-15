import { describe, expect, it } from 'vitest'
import { EmailAlreadyInUseError, type CreateUserCommand } from '../application/create-user'
import type { User } from '../domain/user'
import { DEFAULT_USER_QUERY } from '../domain/user-query'
import { InMemoryUserDirectory, type DirectoryUserGroup } from './in-memory-user-directory'

const user = (id: number, firstName: string, lastName: string, overrides: Partial<User> = {}): User => ({
  id,
  firstName,
  lastName,
  email: `${firstName.toLowerCase()}@example.com`,
  status: 'active',
  roles: ['HR'],
  createdAt: new Date(2026, 0, id),
  updatedAt: new Date(2026, 0, id),
  ...overrides,
})

const groups: DirectoryUserGroup[] = [{ id: 'finance', name: 'Finans', roles: ['MUHASEBE', 'FİNANS'] }]
const now = new Date(2026, 10, 15, 9, 30)

function directory(users: User[] = [user(1, 'Özgür', 'Kaya'), user(2, 'İlayda', 'Alasonyalılar'), user(3, 'Ekin', 'Bulut')]) {
  return new InMemoryUserDirectory({ users, groups, now: () => now })
}

const command: CreateUserCommand = {
  language: 'tr',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: { countryCode: '+90', nationalNumber: '' },
  userGroupId: 'finance',
  profilePhoto: null,
}

describe('InMemoryUserDirectory', () => {
  it('finds users by name or email, ignoring case the Turkish way', async () => {
    const byName = await directory().find({ ...DEFAULT_USER_QUERY, search: 'İLAYDA' })
    const byEmail = await directory().find({ ...DEFAULT_USER_QUERY, search: 'ekin@' })
    const byFullName = await directory().find({ ...DEFAULT_USER_QUERY, search: 'özgür kaya' })

    expect(byName.users.map((found) => found.id)).toEqual([2])
    expect(byEmail.users.map((found) => found.id)).toEqual([3])
    expect(byFullName.users.map((found) => found.id)).toEqual([1])
  })

  it('lists the newest users first, like the users service', async () => {
    const page = await directory().find(DEFAULT_USER_QUERY)

    expect(page.users.map((found) => found.id)).toEqual([3, 2, 1])
  })

  it('returns one page and the total that matched', async () => {
    const many = Array.from({ length: 23 }, (_, index) => user(index + 1, `User${index + 1}`, 'Test'))

    const page = await directory(many).find({ ...DEFAULT_USER_QUERY, page: 3, pageSize: 10 })

    expect(page.total).toBe(23)
    expect(page.users.map((found) => found.id)).toEqual([3, 2, 1])
  })

  it('creates an active user with the next id and the roles of their group', async () => {
    const users = directory()

    const created = await users.create(command)

    expect(created).toEqual({
      id: 4,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      status: 'active',
      roles: ['MUHASEBE', 'FİNANS'],
      createdAt: now,
      updatedAt: now,
    })
    expect((await users.find({ ...DEFAULT_USER_QUERY, search: 'ada' })).users).toEqual([created])
  })

  it('refuses an email that is already in use, whatever its case', async () => {
    await expect(directory().create({ ...command, email: 'EKIN@example.com' })).rejects.toBeInstanceOf(EmailAlreadyInUseError)
  })

  it('changes the status of the chosen users and stamps the change', async () => {
    const users = directory()

    await users.changeStatus([1, 3], 'passive')

    const { users: all } = await users.find(DEFAULT_USER_QUERY)
    expect(all.map((found) => [found.id, found.status])).toEqual([[3, 'passive'], [2, 'active'], [1, 'passive']])
    expect(all[0].updatedAt).toEqual(now)
  })

  it('lists its user groups', async () => {
    await expect(directory().list()).resolves.toEqual([{ id: 'finance', name: 'Finans' }])
  })
})
