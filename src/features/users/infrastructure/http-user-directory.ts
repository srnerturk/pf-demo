import type { UserFinder } from '../application/list-users'
import type { User, UserStatus } from '../domain/user'
import type { UserPage, UserQuery } from '../domain/user-query'

interface HttpUserDirectoryOptions {
  /** Where the admin service lives, e.g. https://pf-admin-uat.halkode.com.tr */
  baseUrl: string
  fetch: typeof globalThis.fetch
  /** The signed-in person's access token, or null when nobody is signed in. */
  accessToken: () => string | null
}

/** Wire format of one user in GET /users. Only the fields this app reads. */
interface UserRecord {
  id: number
  first_name: string
  last_name: string
  email: string
  /** The user's status as a code; `status` carries the same thing as a Turkish label. */
  is_admin_verified: number
  /** Role names joined with ", "; empty when the user has none. */
  roles: string
  /** Local date-time without an offset, e.g. 2026-03-09T14:39:19 */
  created_at: string
  updated_at: string
}

/** Wire format of GET /users. Only the fields this app reads. */
interface UsersResponse {
  success: true
  data: { users: unknown[]; total: number }
}

const STATUS_BY_CODE: Readonly<Record<number, UserStatus>> = { 1: 'active', 2: 'passive' }
const ROLE_SEPARATOR = ','

/** Adapter for the users endpoints of the PF admin service's HTTP API. */
export class HttpUserDirectory implements UserFinder {
  private readonly baseUrl: string
  private readonly send: typeof globalThis.fetch
  private readonly accessToken: () => string | null

  constructor({ baseUrl, fetch, accessToken }: HttpUserDirectoryOptions) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    // Called on its own, never as a method of this object: browsers reject `fetch` with a foreign `this`.
    this.send = (input, init) => fetch(input, init)
    this.accessToken = accessToken
  }

  async find({ search, page, pageSize }: UserQuery): Promise<UserPage> {
    const params = new URLSearchParams({ page: String(page), per_page: String(pageSize), page_limit: String(pageSize) })
    if (search !== '') params.set('s', search)

    const response = await this.send(this.url(`users?${params}`), { method: 'GET', headers: this.headers() })
    if (!response.ok) throw new Error(`The admin service answered GET /users with ${response.status}`)

    const body: unknown = await response.json()
    if (!isUsersResponse(body)) throw notAPageOfUsers()
    return { users: body.data.users.map(toUser), total: body.data.total }
  }

  /** The admin service knows who is asking from the bearer token; without one it refuses with 401. */
  private headers(): Record<string, string> {
    const token = this.accessToken()
    return token === null ? { Accept: 'application/json' } : { Accept: 'application/json', Authorization: `Bearer ${token}` }
  }

  private url(path: string): string {
    return new URL(path, this.baseUrl).toString()
  }
}

function notAPageOfUsers(): Error {
  return new Error('The admin service did not answer with a page of users')
}

function toUser(record: unknown): User {
  if (!isUserRecord(record)) throw notAPageOfUsers()
  const status = STATUS_BY_CODE[record.is_admin_verified]
  const createdAt = new Date(record.created_at)
  const updatedAt = new Date(record.updated_at)
  if (status === undefined || !isValidDate(createdAt) || !isValidDate(updatedAt)) throw notAPageOfUsers()

  return {
    id: record.id,
    firstName: record.first_name,
    lastName: record.last_name,
    email: record.email,
    status,
    roles: record.roles
      .split(ROLE_SEPARATOR)
      .map((role) => role.trim())
      .filter((role) => role !== ''),
    createdAt,
    updatedAt,
  }
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime())
}

function isUsersResponse(body: unknown): body is UsersResponse {
  if (typeof body !== 'object' || body === null) return false
  const { success, data } = body as Record<string, unknown>
  if (success !== true || typeof data !== 'object' || data === null) return false
  const { users, total } = data as Record<string, unknown>
  return Array.isArray(users) && typeof total === 'number'
}

function isUserRecord(record: unknown): record is UserRecord {
  if (typeof record !== 'object' || record === null) return false
  const { id, first_name, last_name, email, is_admin_verified, roles, created_at, updated_at } = record as Record<
    string,
    unknown
  >
  return (
    typeof id === 'number' &&
    typeof first_name === 'string' &&
    typeof last_name === 'string' &&
    typeof email === 'string' &&
    typeof is_admin_verified === 'number' &&
    typeof roles === 'string' &&
    typeof created_at === 'string' &&
    typeof updated_at === 'string'
  )
}
