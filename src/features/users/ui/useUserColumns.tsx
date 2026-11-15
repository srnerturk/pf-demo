import type { DataTableColumn } from '@/shared/components/data-table/DataTable'
import { useI18n } from '@/shared/i18n/useI18n'
import type { User } from '../domain/user'
import { RoleList } from './RoleList'
import { UserIdentity } from './UserIdentity'
import { UserStatusBadge } from './UserStatusBadge'

/** The user table's columns, in the interface language. */
export function useUserColumns(): DataTableColumn<User>[] {
  const { t, formatDateTime } = useI18n()

  return [
    { id: 'id', header: t('users.columns.id'), cell: (user) => user.id, className: 'w-20 tabular-nums text-muted-foreground' },
    { id: 'name', header: t('users.columns.user'), cell: (user) => <UserIdentity user={user} /> },
    { id: 'status', header: t('users.columns.status'), cell: (user) => <UserStatusBadge status={user.status} /> },
    { id: 'roles', header: t('users.columns.roles'), cell: (user) => <RoleList roles={user.roles} /> },
    {
      id: 'createdAt',
      header: t('users.columns.createdAt'),
     
      cell: (user) => formatDateTime(user.createdAt),
      className: 'whitespace-nowrap tabular-nums text-muted-foreground',
    },
    {
      id: 'updatedAt',
      header: t('users.columns.updatedAt'),
     
      cell: (user) => formatDateTime(user.updatedAt),
      className: 'whitespace-nowrap tabular-nums text-muted-foreground',
    },
  ]
}
