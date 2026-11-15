import { Navigate, Route, Routes } from 'react-router'
import type { SessionStore } from '@/features/auth/application/session-store'
import { SessionProvider } from '@/features/auth/ui/SessionProvider'
import { DashboardHome } from '@/features/dashboard/ui/DashboardHome'
import type { ThemePreferenceStore } from '@/features/theme/application/theme-preference-store'
import { ThemeProvider } from '@/features/theme/ui/ThemeProvider'
import { DashboardLayout } from './layouts/DashboardLayout'
import { adminMenu } from './navigation/admin-menu'
import { MenuItemPage } from './pages/MenuItemPage'
import { SignInPage, type SignInPageProps } from './pages/SignInPage'
import { paths } from './paths'
import { RedirectIfSignedIn } from './routing/RedirectIfSignedIn'
import { RequireSession } from './routing/RequireSession'

interface AppProps extends SignInPageProps {
  sessionStore: SessionStore
  themePreferenceStore: ThemePreferenceStore
  /** Whether the operating system asks for dark mode; used until the person picks a theme. */
  systemPrefersDark: boolean
}

/** The app's pages and who may see them. Expects to be rendered inside a router. */
export function App({ sessionStore, themePreferenceStore, systemPrefersDark, ...signInPage }: AppProps) {
  return (
    <ThemeProvider store={themePreferenceStore} systemPrefersDark={systemPrefersDark}>
      <SessionProvider store={sessionStore}>
        <Routes>
          <Route element={<RedirectIfSignedIn />}>
            <Route path={paths.signIn} element={<SignInPage {...signInPage} />} />
          </Route>
          <Route element={<RequireSession />}>
            <Route element={<DashboardLayout menu={adminMenu} />}>
              <Route index element={<DashboardHome />} />
              {adminMenu.flatMap((section) =>
                section.items.map((item) => (
                  <Route key={item.path} path={item.path} element={<MenuItemPage section={section.label} title={item.label} />} />
                )),
              )}
            </Route>
          </Route>
          <Route path="*" element={<Navigate to={paths.home} replace />} />
        </Routes>
      </SessionProvider>
    </ThemeProvider>
  )
}
