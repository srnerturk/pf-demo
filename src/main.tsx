import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from '@/app/App'
import { makeResendOneTimeCode } from '@/features/auth/application/resend-one-time-code'
import { makeSignIn } from '@/features/auth/application/sign-in'
import { makeVerifyOneTimeCode } from '@/features/auth/application/verify-one-time-code'
import { InMemoryAuthenticator, type InMemoryAccount } from '@/features/auth/infrastructure/in-memory-authenticator'
import { WebStorageSessionStore } from '@/features/auth/infrastructure/web-storage-session-store'
import { WebStorageThemePreferenceStore } from '@/features/theme/infrastructure/web-storage-theme-preference-store'
import './index.css'

// Composition root: the only place that knows which adapters back the ports.
// Replace the in-memory authenticator with an HTTP adapter once an API exists.
const demoAccount: InMemoryAccount = { email: 'demo@example.com', password: 'password123', oneTimeCode: '123456' }
const authenticator = new InMemoryAuthenticator({ account: demoAccount, latencyMs: 700 })
const sessionStore = new WebStorageSessionStore(window.localStorage)
const themePreferenceStore = new WebStorageThemePreferenceStore(window.localStorage)
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

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
        footnote={`Demo account: sign in as ${demoAccount.email} with password ${demoAccount.password}, then use code ${demoAccount.oneTimeCode}.`}
      />
    </BrowserRouter>
  </StrictMode>,
)
