import { Navigate, Outlet } from 'react-router'
import { useSession } from '@/features/auth/ui/useSession'
import { paths } from '../paths'

/** Lets signed-in people through; sends everyone else to sign in. */
export function RequireSession() {
  const { session } = useSession()
  return session ? <Outlet /> : <Navigate to={paths.signIn} replace />
}
