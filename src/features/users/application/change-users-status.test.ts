import { describe, expect, it, vi } from 'vitest'
import { makeChangeUsersStatus, type UserStatusChanger } from './change-users-status'

describe('changeUsersStatus', () => {
  it('changes the status of each chosen user once', async () => {
    const changer: UserStatusChanger = { changeStatus: vi.fn<UserStatusChanger['changeStatus']>().mockResolvedValue() }

    await makeChangeUsersStatus(changer)([3, 1, 3], 'passive')

    expect(changer.changeStatus).toHaveBeenCalledWith([3, 1], 'passive')
  })

  it('does nothing when no user is chosen', async () => {
    const changer: UserStatusChanger = { changeStatus: vi.fn<UserStatusChanger['changeStatus']>() }

    await makeChangeUsersStatus(changer)([], 'active')

    expect(changer.changeStatus).not.toHaveBeenCalled()
  })
})
