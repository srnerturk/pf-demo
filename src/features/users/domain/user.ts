/** Whether a user may sign in to the panel. */
export type UserStatus = 'active' | 'passive'

/** The language a user receives emails and notifications in. */
export type UserLanguage = 'tr' | 'en'

/** A person who can use the admin panel. */
export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  status: UserStatus
  roles: readonly string[]
  createdAt: Date
  updatedAt: Date
}

/** A named set of roles a new user joins. */
export interface UserGroup {
  id: string
  name: string
}

export function fullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`
}
