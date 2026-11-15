import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from '@/app/App'
import { makeResendOneTimeCode } from '@/features/auth/application/resend-one-time-code'
import { makeSignIn } from '@/features/auth/application/sign-in'
import { makeVerifyOneTimeCode } from '@/features/auth/application/verify-one-time-code'
import { InMemoryAuthenticator, type InMemoryAccount } from '@/features/auth/infrastructure/in-memory-authenticator'
import { WebStorageSessionStore } from '@/features/auth/infrastructure/web-storage-session-store'
import { makeChangeUsersStatus } from '@/features/users/application/change-users-status'
import { makeCreateUser } from '@/features/users/application/create-user'
import { makeExportUsers } from '@/features/users/application/export-users'
import { makeListUserGroups } from '@/features/users/application/list-user-groups'
import { makeListUsers } from '@/features/users/application/list-users'
import { demoUserGroups, demoUsers } from '@/features/users/infrastructure/demo-user-directory'
import { InMemoryUserDirectory } from '@/features/users/infrastructure/in-memory-user-directory'
import { saveFileInBrowser } from '@/shared/lib/save-file'
import { WebStorageThemePreferenceStore } from '@/features/theme/infrastructure/web-storage-theme-preference-store'
import { WebStorageLocalePreferenceStore } from '@/shared/i18n/web-storage-locale-preference-store'
import './index.css'

// Composition root: the only place that knows which adapters back the ports.
// Replace the in-memory authenticator with an HTTP adapter once an API exists.
const demoAccount: InMemoryAccount = { email: 'demo@example.com', password: 'password123', oneTimeCode: '123456' }
const authenticator = new InMemoryAuthenticator({ account: demoAccount, latencyMs: 700 })
const sessionStore = new WebStorageSessionStore(window.localStorage)
const themePreferenceStore = new WebStorageThemePreferenceStore(window.localStorage)
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const localePreferenceStore = new WebStorageLocalePreferenceStore(window.localStorage)
// Replace the in-memory directory with an HTTP adapter for the users API once it exists.
const userDirectory = new InMemoryUserDirectory({ users: demoUsers, groups: demoUserGroups, latencyMs: 400 })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App
        signIn={makeSignIn(authenticator)}
        verifyOneTimeCode={makeVerifyOneTimeCode(authenticator)}
        resendOneTimeCode={makeResendOneTimeCode(authenticator)}
        sessionStore={sessionStore}
        themePreferenceStore={themePreferenceStore}
        systemPrefersDark={systemPrefersDark}
        localePreferenceStore={localePreferenceStore}
        preferredLanguages={navigator.languages}
        userManagement={{
          listUsers: makeListUsers(userDirectory),
          exportUsers: makeExportUsers(userDirectory),
          createUser: makeCreateUser(userDirectory),
          changeUsersStatus: makeChangeUsersStatus(userDirectory),
          listUserGroups: makeListUserGroups(userDirectory),
          saveFile: saveFileInBrowser,
        }}
        footnote={`Demo account: sign in as ${demoAccount.email} with password ${demoAccount.password}, then use code ${demoAccount.oneTimeCode}.`}
      />
    </BrowserRouter>
  </StrictMode>,
)
