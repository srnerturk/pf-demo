import { fullName, type User } from '../domain/user'

/** Initials, full name and email: how a user is recognised in a list. */
export function UserIdentity({ user }: { user: User }) {
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`

  return (
    <div className="flex min-w-48 items-center gap-3">
      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {initials}
      </span>
      <div className="grid">
        <span className="font-medium">{fullName(user)}</span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
    </div>
  )
}
