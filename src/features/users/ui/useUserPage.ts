import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ListUsers } from '../application/list-users'
import type { UserPage, UserQuery } from '../domain/user-query'

interface UserPageState {
  /** The latest page that loaded; kept on screen while the next one loads. */
  page: UserPage | null
  loading: boolean
  failed: boolean
  /** Fetches the current query again, e.g. after a change or a failure. */
  reload(): void
}

interface Request {
  query: UserQuery
  attempt: number
}

/** The page of users for `query`, refetched when it changes. Only the latest request's answer counts. */
export function useUserPage(listUsers: ListUsers, query: UserQuery): UserPageState {
  const [attempt, setAttempt] = useState(0)
  const request = useMemo<Request>(() => ({ query, attempt }), [query, attempt])
  const [page, setPage] = useState<UserPage | null>(null)
  const [answered, setAnswered] = useState<{ request: Request; failed: boolean } | null>(null)

  useEffect(() => {
    let latest = true
    listUsers(request.query).then(
      (found) => {
        if (!latest) return
        setPage(found)
        setAnswered({ request, failed: false })
      },
      () => latest && setAnswered({ request, failed: true }),
    )
    return () => {
      latest = false
    }
  }, [listUsers, request])

  const reload = useCallback(() => setAttempt((count) => count + 1), [])
  const settled = answered?.request === request

  return { page, loading: !settled, failed: settled && answered.failed, reload }
}
