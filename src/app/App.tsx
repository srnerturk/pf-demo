import { Navigate, Route, Routes } from 'react-router'
import type { SessionStore } from '@/features/auth/application/session-store'
import { SessionProvider } from '@/features/auth/ui/SessionProvider'
import { DashboardHome } from '@/features/dashboard/ui/DashboardHome'
import { DashboardLayout } from './layouts/DashboardLayout'
import { SignInPage, type SignInPageProps } from './pages/SignInPage'
import { paths } from './paths'
import { RedirectIfSignedIn } from './routing/RedirectIfSignedIn'
import { RequireSession } from './routing/RequireSession'

interface AppProps extends SignInPageProps {
  sessionStore: SessionStore
}

/** The app's pages and who may see them. Expects to be rendered inside a router. */
export function App({ sessionStore, ...signInPage }: AppProps) {
  return (
    <SessionProvider store={sessionStore}>
      <Routes>
        <Route element={<RedirectIfSignedIn />}>
          <Route path={paths.signIn} element={<SignInPage {...signInPage} />} />
        </Route>
        <Route element={<RequireSession />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={paths.home} replace />} />
      </Routes>
    </SessionProvider>
  )
}
