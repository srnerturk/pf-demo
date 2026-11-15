import { Navigate, Outlet } from 'react-router'
import { useSession } from '@/features/auth/ui/useSession'
import { paths } from '../paths'

/** Keeps signed-in people off the sign-in pages by sending them home. */
export function RedirectIfSignedIn() {
  const { session } = useSession()
  return session ? <Navigate to={paths.home} replace /> : <Outlet />
}
