import { Navigate, Route, Routes } from 'react-router'
import type { SessionStore } from '@/features/auth/application/session-store'
import { SessionProvider } from '@/features/auth/ui/SessionProvider'
import { DashboardHome } from '@/features/dashboard/ui/DashboardHome'
import type { ThemePreferenceStore } from '@/features/theme/application/theme-preference-store'
import { ThemeProvider } from '@/features/theme/ui/ThemeProvider'
import type { UserManagementProps } from '@/features/users/ui/UserManagement'
import { I18nProvider } from '@/shared/i18n/I18nProvider'
import type { LocalePreferenceStore } from '@/shared/i18n/locale-preference-store'
import { DashboardLayout } from './layouts/DashboardLayout'
import { adminMenu } from './navigation/admin-menu'
import { MenuItemPage } from './pages/MenuItemPage'
import { SignInPage, type SignInPageProps } from './pages/SignInPage'
import { UsersPage } from './pages/UsersPage'
import { paths } from './paths'
import { RedirectIfSignedIn } from './routing/RedirectIfSignedIn'
import { RequireSession } from './routing/RequireSession'

interface AppProps extends SignInPageProps {
  sessionStore: SessionStore
  themePreferenceStore: ThemePreferenceStore
  /** Whether the operating system asks for dark mode; used until the person picks a theme. */
  systemPrefersDark: boolean
  localePreferenceStore: LocalePreferenceStore
  /** The browser's languages, most preferred first; used until the person picks a language. */
  preferredLanguages: readonly string[]
  userManagement: UserManagementProps
}

/** The app's pages and who may see them. Expects to be rendered inside a router. */
export function App({
  sessionStore,
  themePreferenceStore,
  systemPrefersDark,
  localePreferenceStore,
  preferredLanguages,
  userManagement,
  ...signInPage
}: AppProps) {
  return (
    <I18nProvider store={localePreferenceStore} preferredLanguages={preferredLanguages}>
    <ThemeProvider store={themePreferenceStore} systemPrefersDark={systemPrefersDark}>
      <SessionProvider store={sessionStore}>
        <Routes>
          <Route element={<RedirectIfSignedIn />}>
            <Route path={paths.signIn} element={<SignInPage {...signInPage} />} />
          </Route>
          <Route element={<RequireSession />}>
            <Route element={<DashboardLayout menu={adminMenu} />}>
              <Route index element={<DashboardHome />} />
              <Route path={paths.accessControl.users} element={<UsersPage {...userManagement} />} />
              {adminMenu.flatMap((section) =>
                section.items.filter((item) => item.path !== paths.accessControl.users).map((item) => (
                  <Route key={item.path} path={item.path} element={<MenuItemPage sectionKey={section.labelKey} titleKey={item.labelKey} />} />
                )),
              )}
            </Route>
          </Route>
          <Route path="*" element={<Navigate to={paths.home} replace />} />
        </Routes>
      </SessionProvider>
    </ThemeProvider>
    </I18nProvider>
  )
}
