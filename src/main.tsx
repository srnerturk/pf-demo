import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { makeResendOneTimeCode } from '@/features/auth/application/resend-one-time-code'
import { makeSignIn } from '@/features/auth/application/sign-in'
import { makeVerifyOneTimeCode } from '@/features/auth/application/verify-one-time-code'
import { InMemoryAuthenticator, type InMemoryAccount } from '@/features/auth/infrastructure/in-memory-authenticator'
import './index.css'

// Composition root: the only place that knows which adapters back the ports.
// Replace the in-memory authenticator with an HTTP adapter once an API exists.
const demoAccount: InMemoryAccount = { email: 'demo@example.com', password: 'password123', oneTimeCode: '123456' }
const authenticator = new InMemoryAuthenticator({ account: demoAccount, latencyMs: 700 })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      signIn={makeSignIn(authenticator)}
      verifyOneTimeCode={makeVerifyOneTimeCode(authenticator)}
      resendOneTimeCode={makeResendOneTimeCode(authenticator)}
      footnote={`Demo account: sign in as ${demoAccount.email} with password ${demoAccount.password}, then use code ${demoAccount.oneTimeCode}.`}
    />
  </StrictMode>,
)
