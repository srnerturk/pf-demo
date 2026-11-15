import type { Session } from '../domain/authentication'
import { primaryButtonClassName } from './button-styles'
import { CheckIcon } from './icons'
import { ScreenHeader } from './ScreenHeader'

interface SignedInProps {
  session: Session
  onSignOut: () => void
}

export function SignedIn({ session, onSignOut }: SignedInProps) {
  return (
    <>
      <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/15">
        <CheckIcon />
      </div>
      <ScreenHeader
        title="You’re signed in"
        description={
          <>
            Signed in as <span className="font-medium text-slate-900">{session.email}</span>.
          </>
        }
        focusOnMount
      />
      <button type="button" onClick={onSignOut} className={primaryButtonClassName}>
        Sign out
      </button>
    </>
  )
}
