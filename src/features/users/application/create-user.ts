import { validateNewUser, type NewUser, type NewUserViolations, type ProfilePhotoFacts } from '../domain/new-user'
import type { User } from '../domain/user'

/** A chosen profile photo: the facts the rules check, plus its bytes. */
export interface ProfilePhoto extends ProfilePhotoFacts {
  content: Blob
}

/** What the create form submits. */
export interface CreateUserCommand extends Omit<NewUser, 'profilePhoto'> {
  profilePhoto: ProfilePhoto | null
}

/** Port: adds a user to the system. Throws `EmailAlreadyInUseError` when the email is taken. */
export interface UserCreator {
  create(command: CreateUserCommand): Promise<User>
}

export type CreateUser = (command: CreateUserCommand) => Promise<User>

export class InvalidNewUserError extends Error {
  readonly violations: NewUserViolations

  constructor(violations: NewUserViolations) {
    super(`Invalid new user: ${Object.keys(violations).join(', ')}`)
    this.name = 'InvalidNewUserError'
    this.violations = violations
  }
}

export class EmailAlreadyInUseError extends Error {
  constructor(email: string) {
    super(`A user with ${email} already exists`)
    this.name = 'EmailAlreadyInUseError'
  }
}

export function makeCreateUser(creator: UserCreator): CreateUser {
  return async (draft) => {
    const command: CreateUserCommand = {
      ...draft,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim(),
      phone: { ...draft.phone, nationalNumber: draft.phone.nationalNumber.replace(/\s/g, '') },
    }

    const violations = validateNewUser(command)
    if (Object.keys(violations).length > 0) throw new InvalidNewUserError(violations)

    return creator.create(command)
  }
}
