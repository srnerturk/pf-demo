import { makeChangeUsersStatus } from '../application/change-users-status'
import { makeCreateUser } from '../application/create-user'
import { makeExportUsers } from '../application/export-users'
import { makeListUserGroups } from '../application/list-user-groups'
import { makeListUsers } from '../application/list-users'
import type { User } from '../domain/user'
import { InMemoryUserDirectory, type DirectoryUserGroup } from '../infrastructure/in-memory-user-directory'

export const testGroups: DirectoryUserGroup[] = [
  { id: 'finance', name: 'Finans', roles: ['MUHASEBE', 'FİNANS'] },
  { id: 'administrators', name: 'Yöneticiler', roles: ['ADMIN_ROLE', 'HR', 'TECH'] },
]

/** `count` users with ids 1…count, named User1…, created a day apart. */
export function testUsers(count: number): User[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    firstName: `User${index + 1}`,
    lastName: 'Test',
    email: `user${index + 1}@example.com`,
    status: 'active',
    roles: testGroups[1].roles,
    createdAt: new Date(2026, 0, index + 1, 9, 0),
    updatedAt: new Date(2026, 0, index + 1, 9, 0),
  }))
}

/** The real use cases over an in-memory directory: what the screen gets in the composition root. */
export function testUseCases(users: User[]) {
  const directory = new InMemoryUserDirectory({ users, groups: testGroups, now: () => new Date(2026, 10, 15, 10, 0) })
  return {
    directory,
    listUsers: makeListUsers(directory),
    exportUsers: makeExportUsers(directory),
    createUser: makeCreateUser(directory),
    changeUsersStatus: makeChangeUsersStatus(directory),
    listUserGroups: makeListUserGroups(directory),
  }
}
