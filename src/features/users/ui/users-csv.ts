import type { MessageKey } from '@/shared/i18n/catalog'
import { toCsv } from '@/shared/lib/csv'
import type { User } from '../domain/user'

type Translate = (key: MessageKey) => string

const COLUMNS: readonly [MessageKey, (user: User, t: Translate) => string][] = [
  ['users.columns.id', (user) => String(user.id)],
  ['users.columns.firstName', (user) => user.firstName],
  ['users.columns.lastName', (user) => user.lastName],
  ['users.columns.email', (user) => user.email],
  ['users.columns.status', (user, t) => t(`users.status.${user.status}`)],
  ['users.columns.roles', (user) => user.roles.join(', ')],
  ['users.columns.createdAt', (user) => timestamp(user.createdAt)],
  ['users.columns.updatedAt', (user) => timestamp(user.updatedAt)],
]

/** Users as a CSV sheet with headers in the interface language. */
export function usersCsv(users: readonly User[], t: Translate): string {
  return toCsv([COLUMNS.map(([header]) => t(header)), ...users.map((user) => COLUMNS.map(([, value]) => value(user, t)))])
}

/** `YYYY-MM-DD HH:mm` in local time: sorts as text and reads the same in every language. */
export function timestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
