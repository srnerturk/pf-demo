import { CircleAlertIcon, CircleCheckIcon, DownloadIcon, PlusIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable, type RowId, type TableSort } from '@/shared/components/data-table/DataTable'
import { TablePagination } from '@/shared/components/data-table/TablePagination'
import { SearchInput } from '@/shared/components/SearchInput'
import { useI18n } from '@/shared/i18n/useI18n'
import type { SaveFile } from '@/shared/lib/save-file'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import type { ChangeUsersStatus } from '../application/change-users-status'
import type { CreateUser } from '../application/create-user'
import type { ExportUsers } from '../application/export-users'
import type { ListUserGroups } from '../application/list-user-groups'
import type { ListUsers } from '../application/list-users'
import { fullName, type User, type UserStatus } from '../domain/user'
import { DEFAULT_USER_QUERY, PAGE_SIZES, type PageSize, type UserQuery, type UserSortField } from '../domain/user-query'
import { BulkActionBar } from './BulkActionBar'
import { CreateUserDialog } from './CreateUserDialog'
import { useDebouncedValue } from './useDebouncedValue'
import { useUserColumns } from './useUserColumns'
import { useUserPage } from './useUserPage'
import { timestamp, usersCsv } from './users-csv'

export interface UserManagementProps {
  listUsers: ListUsers
  exportUsers: ExportUsers
  createUser: CreateUser
  changeUsersStatus: ChangeUsersStatus
  listUserGroups: ListUserGroups
  saveFile: SaveFile
  /** How long typing must pause before the search runs. */
  searchDelayMs?: number
}

type Feedback = { tone: 'success' | 'error'; message: string } | null

const SORT_FIELDS: readonly string[] = ['id', 'name', 'email', 'status', 'createdAt', 'updatedAt'] satisfies UserSortField[]
const isUserSortField = (columnId: string): columnId is UserSortField => SORT_FIELDS.includes(columnId)
const isPageSize = (size: number): size is PageSize => (PAGE_SIZES as readonly number[]).includes(size)

/** The user list: search, sort, page, act on several users at once, export, and add a user. */
export function UserManagement({
  listUsers,
  exportUsers,
  createUser,
  changeUsersStatus,
  listUserGroups,
  saveFile,
  searchDelayMs = 300,
}: UserManagementProps) {
  const { t } = useI18n()
  const columns = useUserColumns()
  const [searchText, setSearchText] = useState('')
  const search = useDebouncedValue(searchText, searchDelayMs)
  const [view, setView] = useState<Omit<UserQuery, 'search'>>(DEFAULT_USER_QUERY)
  const [searchedFor, setSearchedFor] = useState(search)
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<RowId>>(new Set())
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [busy, setBusy] = useState(false)
  const [creating, setCreating] = useState(false)

  // A new search starts again from the first page.
  if (search !== searchedFor) {
    setSearchedFor(search)
    setView((current) => ({ ...current, page: 1 }))
  }

  const query = useMemo<UserQuery>(() => ({ ...view, search }), [view, search])
  const { page, loading, failed, reload } = useUserPage(listUsers, query)
  const users = page?.users ?? []

  const changeSort = ({ columnId, direction }: TableSort) => {
    if (isUserSortField(columnId)) setView((current) => ({ ...current, sort: { field: columnId, direction }, page: 1 }))
  }

  const changeStatus = async (status: UserStatus) => {
    const ids = [...selectedIds].map(Number)
    setBusy(true)
    try {
      await changeUsersStatus(ids, status)
      setSelectedIds(new Set())
      setFeedback({ tone: 'success', message: t('users.bulk.done', { count: ids.length }) })
      reload()
    } catch {
      setFeedback({ tone: 'error', message: t('users.bulk.failed') })
    } finally {
      setBusy(false)
    }
  }

  const exportCsv = async () => {
    setBusy(true)
    try {
      const exported = await exportUsers({ search, sort: view.sort })
      saveFile({
        name: `${t('users.exportFileName')}-${timestamp(new Date()).slice(0, 10)}.csv`,
        content: usersCsv(exported, t),
        mediaType: 'text/csv;charset=utf-8',
      })
    } catch {
      setFeedback({ tone: 'error', message: t('users.exportFailed') })
    } finally {
      setBusy(false)
    }
  }

  const userCreated = (user: User) => {
    setCreating(false)
    setFeedback({ tone: 'success', message: t('users.create.created', { name: fullName(user) }) })
    setView((current) => ({ ...current, page: 1 }))
    reload()
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-5">
        <CardTitle className="text-lg">{t('users.listTitle')}</CardTitle>
        <CardDescription>{t('users.listDescription')}</CardDescription>
        <CardAction>
          <Button type="button" onClick={() => setCreating(true)}>
            <PlusIcon aria-hidden />
            {t('users.add')}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="grid gap-4 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            label={t('users.search')}
            placeholder={t('users.searchPlaceholder')}
            value={searchText}
            onValueChange={setSearchText}
            className="sm:w-80"
          />
          <Button type="button" variant="outline" disabled={busy} onClick={exportCsv}>
            <DownloadIcon aria-hidden />
            {t('users.export')}
          </Button>
        </div>

        {feedback?.tone === 'success' && (
          <output className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            <CircleCheckIcon className="size-4 shrink-0" aria-hidden />
            {feedback.message}
          </output>
        )}
        {feedback?.tone === 'error' && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}

        {selectedIds.size > 0 && (
          <BulkActionBar selectedCount={selectedIds.size} busy={busy} onChangeStatus={changeStatus} onClear={() => setSelectedIds(new Set())} />
        )}

        {failed ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
              {t('users.loadFailed')}
              <Button type="button" variant="outline" size="sm" onClick={reload}>
                {t('common.retry')}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <DataTable
            label={t('users.listTitle')}
            columns={columns}
            rows={users}
            getRowId={(user) => user.id}
            getRowLabel={(user) => fullName(user)}
            sort={{ columnId: view.sort.field, direction: view.sort.direction }}
            onSortChange={changeSort}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            loading={loading}
            emptyState={t('users.empty')}
            placeholderRows={view.pageSize > 10 ? 10 : view.pageSize}
          />
        )}

        {page && (
          <TablePagination
            page={view.page}
            pageSize={view.pageSize}
            pageSizes={PAGE_SIZES}
            total={page.total}
            onPageChange={(next) => setView((current) => ({ ...current, page: next }))}
            onPageSizeChange={(size) => isPageSize(size) && setView((current) => ({ ...current, pageSize: size, page: 1 }))}
          />
        )}
      </CardContent>

      <CreateUserDialog open={creating} onOpenChange={setCreating} createUser={createUser} listUserGroups={listUserGroups} onCreated={userCreated} />
    </Card>
  )
}
