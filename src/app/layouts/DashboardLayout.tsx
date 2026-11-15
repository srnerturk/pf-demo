import { LogOutIcon } from 'lucide-react'
import { Outlet } from 'react-router'
import { useSession } from '@/features/auth/ui/useSession'
import { Button } from '@/shared/ui/button'
import { BrandMark } from '../components/BrandMark'

/** Frame for signed-in pages: a header with who is signed in and a way out. */
export function DashboardLayout() {
  const { session, endSession } = useSession()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandMark />
          <div className="flex min-w-0 items-center gap-3">
            {session && (
              <span className="hidden truncate text-sm text-muted-foreground sm:inline">{session.email}</span>
            )}
            <Button type="button" variant="outline" size="sm" onClick={endSession}>
              <LogOutIcon aria-hidden />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
