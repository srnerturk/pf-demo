import { EmailAlreadyInUseError, type CreateUserCommand, type UserCreator } from '../application/create-user'
import type { UserStatusChanger } from '../application/change-users-status'
import type { UserGroupCatalog } from '../application/list-user-groups'
import type { UserFinder } from '../application/list-users'
import { fullName, type User, type UserGroup, type UserStatus } from '../domain/user'
import type { UserPage, UserQuery, UserSortField } from '../domain/user-query'

/** A user group as the directory stores it: with the roles its members get. */
export interface DirectoryUserGroup extends UserGroup {
  roles: readonly string[]
}

interface InMemoryUserDirectoryOptions {
  users: readonly User[]
  groups: readonly DirectoryUserGroup[]
  latencyMs?: number
  now?: () => Date
}

const COLLATION_LOCALE = 'tr'

const compareBy: Record<UserSortField, (a: User, b: User) => number> = {
  id: (a, b) => a.id - b.id,
  name: (a, b) => fullName(a).localeCompare(fullName(b), COLLATION_LOCALE),
  email: (a, b) => a.email.localeCompare(b.email, COLLATION_LOCALE),
  status: (a, b) => a.status.localeCompare(b.status),
  createdAt: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  updatedAt: (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime(),
}

/** Stand-in for the users API until it exists; swap it for an HTTP adapter in the composition root. */
export class InMemoryUserDirectory implements UserFinder, UserCreator, UserStatusChanger, UserGroupCatalog {
  private users: User[]
  private readonly groups: readonly DirectoryUserGroup[]
  private readonly latencyMs: number
  private readonly now: () => Date

  constructor({ users, groups, latencyMs = 0, now = () => new Date() }: InMemoryUserDirectoryOptions) {
    this.users = [...users]
    this.groups = groups
    this.latencyMs = latencyMs
    this.now = now
  }

  async find({ search, sort, page, pageSize }: UserQuery): Promise<UserPage> {
    await this.respond()
    const direction = sort.direction === 'asc' ? 1 : -1
    const matching = this.users
      .filter((user) => matches(user, search))
      .sort((a, b) => direction * compareBy[sort.field](a, b))
    const start = (page - 1) * pageSize
    return { users: matching.slice(start, start + pageSize), total: matching.length }
  }

  async create(command: CreateUserCommand): Promise<User> {
    await this.respond()
    if (this.users.some((user) => normaliseEmail(user.email) === normaliseEmail(command.email))) {
      throw new EmailAlreadyInUseError(command.email)
    }
    const createdAt = this.now()
    const user: User = {
      id: Math.max(0, ...this.users.map((existing) => existing.id)) + 1,
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      status: 'active',
      roles: this.groups.find((group) => group.id === command.userGroupId)?.roles ?? [],
      createdAt,
      updatedAt: createdAt,
    }
    this.users.push(user)
    return user
  }

  async changeStatus(userIds: readonly User['id'][], status: UserStatus): Promise<void> {
    await this.respond()
    const updatedAt = this.now()
    this.users = this.users.map((user) => (userIds.includes(user.id) ? { ...user, status, updatedAt } : user))
  }

  async list(): Promise<UserGroup[]> {
    await this.respond()
    return this.groups.map(({ id, name }) => ({ id, name }))
  }

  private respond(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.latencyMs))
  }
}

/** Names compare the Turkish way (İ/i, I/ı); email addresses compare without locale rules. */
function matches(user: User, search: string): boolean {
  const name = normaliseName(fullName(user))
  const email = normaliseEmail(user.email)
  return name.includes(normaliseName(search)) || email.includes(normaliseEmail(search))
}

function normaliseName(text: string): string {
  return text.trim().toLocaleLowerCase(COLLATION_LOCALE)
}

function normaliseEmail(text: string): string {
  return text.trim().toLowerCase()
}
