import type { UserGroup } from '../domain/user'

/** Port: the groups a new user can join. */
export interface UserGroupCatalog {
  list(): Promise<UserGroup[]>
}

export type ListUserGroups = () => Promise<UserGroup[]>

export function makeListUserGroups(catalog: UserGroupCatalog): ListUserGroups {
  return () => catalog.list()
}
