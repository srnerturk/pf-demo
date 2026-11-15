import { CheckIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { Session } from '../domain/authentication'
import { ScreenHeader } from './ScreenHeader'

interface SignedInProps {
  session: Session
  onSignOut: () => void
}

export function SignedIn({ session, onSignOut }: SignedInProps) {
  return (
    <>
      <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-success/10 text-success ring-1 ring-success/20">
        <CheckIcon className="size-5" strokeWidth={2.5} aria-hidden />
      </div>
      <ScreenHeader
        title="You’re signed in"
        description={
          <>
            Signed in as <span className="font-medium text-foreground">{session.email}</span>.
          </>
        }
        focusOnMount
      />
      <Button type="button" variant="outline" size="lg" onClick={onSignOut} className="w-full">
        Sign out
      </Button>
    </>
  )
}
