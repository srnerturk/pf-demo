import type { User, UserStatus } from '../domain/user'

/** Port: activates or deactivates users. */
export interface UserStatusChanger {
  changeStatus(userIds: readonly User['id'][], status: UserStatus): Promise<void>
}

export type ChangeUsersStatus = (userIds: readonly User['id'][], status: UserStatus) => Promise<void>

export function makeChangeUsersStatus(changer: UserStatusChanger): ChangeUsersStatus {
  return async (userIds, status) => {
    const unique = [...new Set(userIds)]
    if (unique.length === 0) return
    await changer.changeStatus(unique, status)
  }
}
