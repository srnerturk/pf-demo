import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from '@/app/App'
import { makeRequestCaptcha } from '@/features/auth/application/request-captcha'
import { makeResendOneTimeCode } from '@/features/auth/application/resend-one-time-code'
import { makeSignIn } from '@/features/auth/application/sign-in'
import { makeVerifyOneTimeCode } from '@/features/auth/application/verify-one-time-code'
import { HttpAuthApi } from '@/features/auth/infrastructure/http-auth-api'
import { InMemoryAuthenticator, type InMemoryAccount } from '@/features/auth/infrastructure/in-memory-authenticator'
import { RememberMeSessionStore } from '@/features/auth/infrastructure/remember-me-session-store'
import { WebStorageDeviceId } from '@/features/auth/infrastructure/web-storage-device-id'
import { WebStorageSessionStore } from '@/features/auth/infrastructure/web-storage-session-store'
import { makeChangeUsersStatus } from '@/features/users/application/change-users-status'
import { makeCreateUser } from '@/features/users/application/create-user'
import { makeExportUsers } from '@/features/users/application/export-users'
import { makeListUserGroups } from '@/features/users/application/list-user-groups'
import { makeListUsers } from '@/features/users/application/list-users'
import { demoUserGroups, demoUsers } from '@/features/users/infrastructure/demo-user-directory'
import { HttpUserDirectory } from '@/features/users/infrastructure/http-user-directory'
import { InMemoryUserDirectory } from '@/features/users/infrastructure/in-memory-user-directory'
import { saveFileInBrowser } from '@/shared/lib/save-file'
import { WebStorageThemePreferenceStore } from '@/features/theme/infrastructure/web-storage-theme-preference-store'
import { WebStorageLocalePreferenceStore } from '@/shared/i18n/web-storage-locale-preference-store'
import './index.css'

// Composition root: the only place that knows which adapters back the ports.
const deviceId = new WebStorageDeviceId(window.localStorage)
const authApi = new HttpAuthApi({
  baseUrl: import.meta.env.VITE_AUTH_API_BASE_URL ?? 'https://pf-auth-uat.halkode.com.tr',
  fetch: window.fetch,
  deviceId: () => deviceId.current(),
  now: Date.now,
})
// Resending a one-time code still goes through the in-memory authenticator until HttpAuthApi
// speaks that endpoint: it only pretends to resend.
const demoAccount: InMemoryAccount = { name: 'Demo User', email: 'demo@example.com', password: 'password123', oneTimeCode: '123456' }
const authenticator = new InMemoryAuthenticator({ account: demoAccount, latencyMs: 700 })
// A session outlives the visit (localStorage) only when the person ticked "Remember me".
const sessionStore = new RememberMeSessionStore({
  acrossVisits: new WebStorageSessionStore(window.localStorage),
  thisVisitOnly: new WebStorageSessionStore(window.sessionStorage),
})
const themePreferenceStore = new WebStorageThemePreferenceStore(window.localStorage)
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const localePreferenceStore = new WebStorageLocalePreferenceStore(window.localStorage)
const userDirectory = new HttpUserDirectory({
  baseUrl: import.meta.env.VITE_ADMIN_API_BASE_URL ?? 'https://pf-admin-uat.halkode.com.tr',
  fetch: window.fetch,
  accessToken: () => sessionStore.load()?.tokens.accessToken ?? null,
})
// Creating users, changing their status and listing user groups stay in memory until
// HttpUserDirectory speaks those endpoints: what they change does not reach the listed users.
const demoUserDirectory = new InMemoryUserDirectory({ users: demoUsers, groups: demoUserGroups, latencyMs: 400 })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App
        signIn={makeSignIn(authApi)}
        requestCaptcha={makeRequestCaptcha(authApi)}
        verifyOneTimeCode={makeVerifyOneTimeCode(authApi)}
        resendOneTimeCode={makeResendOneTimeCode(authenticator)}
        sessionStore={sessionStore}
        themePreferenceStore={themePreferenceStore}
        systemPrefersDark={systemPrefersDark}
        localePreferenceStore={localePreferenceStore}
        preferredLanguages={navigator.languages}
        userManagement={{
          listUsers: makeListUsers(userDirectory),
          exportUsers: makeExportUsers(userDirectory),
          createUser: makeCreateUser(demoUserDirectory),
          changeUsersStatus: makeChangeUsersStatus(demoUserDirectory),
          listUserGroups: makeListUserGroups(demoUserDirectory),
          saveFile: saveFileInBrowser,
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
