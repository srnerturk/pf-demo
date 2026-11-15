import { describe, expect, it, vi } from 'vitest'
import type { User } from '../domain/user'
import { makeCreateUser, InvalidNewUserError, type CreateUserCommand, type UserCreator } from './create-user'

const command: CreateUserCommand = {
  language: 'en',
  firstName: '  Ada ',
  lastName: ' Lovelace ',
  email: ' ada@example.com ',
  phone: { countryCode: '+90', nationalNumber: ' 532 123 45 67 ' },
  userGroupId: 'finance',
  profilePhoto: null,
}

const created: User = {
  id: 1,
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  status: 'active',
  roles: ['FINANCE'],
  createdAt: new Date(0),
  updatedAt: new Date(0),
}

describe('createUser', () => {
  it('creates the user from tidied input', async () => {
    const creator: UserCreator = { create: vi.fn<UserCreator['create']>().mockResolvedValue(created) }

    await expect(makeCreateUser(creator)(command)).resolves.toBe(created)
    expect(creator.create).toHaveBeenCalledWith({
      ...command,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: { countryCode: '+90', nationalNumber: '5321234567' },
    })
  })

  it('refuses input that breaks the rules, without creating anything', async () => {
    const creator: UserCreator = { create: vi.fn<UserCreator['create']>() }

    const attempt = makeCreateUser(creator)({ ...command, email: 'nope', firstName: '' })

    await expect(attempt).rejects.toBeInstanceOf(InvalidNewUserError)
    await expect(attempt).rejects.toMatchObject({ violations: { email: 'invalid-email', firstName: 'required' } })
    expect(creator.create).not.toHaveBeenCalled()
  })
})
