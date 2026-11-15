import { describe, expect, it } from 'vitest'
import { DEFAULT_USER_QUERY } from '../domain/user-query'
import { HttpUserDirectory } from './http-user-directory'

interface RecordedRequest {
  url: string
  method: string
  accept: string | null
  authorization: string | null
}

/** Stands in for the network: records each request and answers with the given response. */
function fakeFetch(respond: () => Response) {
  const requests: RecordedRequest[] = []
  const fetch: typeof globalThis.fetch = async (input, init) => {
    requests.push({
      url: String(input),
      method: init?.method ?? 'GET',
      accept: new Headers(init?.headers).get('Accept'),
      authorization: new Headers(init?.headers).get('Authorization'),
    })
    return respond()
  }
  return { fetch, requests }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.signed-in'

function makeDirectory(
  fetch: typeof globalThis.fetch,
  { baseUrl = 'https://admin.example.com', accessToken = (): string | null => ACCESS_TOKEN } = {},
) {
  return new HttpUserDirectory({ baseUrl, fetch, accessToken })
}

const activeUser = {
  id: 2343,
  first_name: 'Cem',
  last_name: 'Köylü',
  email: 'cem.koylu@halkode.com.tr',
  is_admin_verified: 1,
  status: 'Aktif',
  status_color: 'color:rgb(42,174,54)',
  roles: 'ADMIN_ROLE, tek2, RİSK',
  created_at: '2026-03-09T14:39:19',
  updated_at: '2026-11-13T16:09:36',
  login_at: null,
  last_update_date: null,
}

const passiveUserWithoutRoles = {
  ...activeUser,
  id: 1555,
  email: 'cem.koylu@softrobotics.com.tr',
  is_admin_verified: 2,
  status: 'Pasif',
  roles: '',
}

/** What GET /users answers, trimmed to what matters here. */
function usersBody(users: unknown[], total = users.length) {
  return {
    success: true,
    data: {
      users,
      total,
      current_page: 1,
      per_page: 10,
      last_page: 1,
      s: '',
      page_limit: 10,
      allow_access_control_export: true,
      export_types: { '1': 'csv' },
    },
  }
}

describe('HTTP user directory', () => {
  describe('finding users', () => {
    it('asks the users endpoint for one page on behalf of the signed-in person', async () => {
      const { fetch, requests } = fakeFetch(() => json(usersBody([])))

      await makeDirectory(fetch).find({ ...DEFAULT_USER_QUERY, page: 3, pageSize: 25 })

      expect(requests).toEqual([
        {
          url: 'https://admin.example.com/users?page=3&per_page=25&page_limit=25',
          method: 'GET',
          accept: 'application/json',
          authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      ])
    })

    it('asks without credentials when nobody is signed in, leaving the refusal to the service', async () => {
      const { fetch, requests } = fakeFetch(() => json(usersBody([])))

      await makeDirectory(fetch, { accessToken: () => null }).find(DEFAULT_USER_QUERY)

      expect(requests[0].authorization).toBeNull()
    })

    it('passes the search along when there is one', async () => {
      const { fetch, requests } = fakeFetch(() => json(usersBody([])))

      await makeDirectory(fetch, { baseUrl: 'https://admin.example.com/' }).find({ ...DEFAULT_USER_QUERY, search: 'cem köylü' })

      expect(requests[0].url).toBe('https://admin.example.com/users?page=1&per_page=10&page_limit=10&s=cem+k%C3%B6yl%C3%BC')
    })

    it('reads the users on the page and how many match in total', async () => {
      const { fetch } = fakeFetch(() => json(usersBody([activeUser], 31)))

      const page = await makeDirectory(fetch).find(DEFAULT_USER_QUERY)

      expect(page).toEqual({
        total: 31,
        users: [
          {
            id: 2343,
            firstName: 'Cem',
            lastName: 'Köylü',
            email: 'cem.koylu@halkode.com.tr',
            status: 'active',
            roles: ['ADMIN_ROLE', 'tek2', 'RİSK'],
            createdAt: new Date(2026, 2, 9, 14, 39, 19),
            updatedAt: new Date(2026, 10, 13, 16, 9, 36),
          },
        ],
      })
    })

    it('reads a passive user, and an empty role list as no roles', async () => {
      const { fetch } = fakeFetch(() => json(usersBody([passiveUserWithoutRoles])))

      const [user] = (await makeDirectory(fetch).find(DEFAULT_USER_QUERY)).users

      expect(user.status).toBe('passive')
      expect(user.roles).toEqual([])
    })

    it('fails when the server answers with an error status', async () => {
      const { fetch } = fakeFetch(() => json({ message: 'Unauthenticated.' }, 401))

      await expect(makeDirectory(fetch).find(DEFAULT_USER_QUERY)).rejects.toThrow('GET /users with 401')
    })

    it('fails when the service reports that it did not succeed', async () => {
      const { fetch } = fakeFetch(() => json({ ...usersBody([]), success: false }))

      await expect(makeDirectory(fetch).find(DEFAULT_USER_QUERY)).rejects.toThrow('did not answer with a page of users')
    })

    it.each([
      ['an unknown status code', { ...activeUser, is_admin_verified: 7 }],
      ['an unreadable date', { ...activeUser, created_at: 'yesterday' }],
      ['a missing email', { ...activeUser, email: undefined }],
    ])('fails when a user comes with %s', async (_, user) => {
      const { fetch } = fakeFetch(() => json(usersBody([user])))

      await expect(makeDirectory(fetch).find(DEFAULT_USER_QUERY)).rejects.toThrow('did not answer with a page of users')
    })
  })
})
