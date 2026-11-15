import type { ResendOneTimeCode } from '@/features/auth/application/resend-one-time-code'
import type { SignIn } from '@/features/auth/application/sign-in'
import type { VerifyOneTimeCode } from '@/features/auth/application/verify-one-time-code'
import { SignInFlow } from '@/features/auth/ui/SignInFlow'

interface AppProps {
  signIn: SignIn
  verifyOneTimeCode: VerifyOneTimeCode
  resendOneTimeCode: ResendOneTimeCode
  footnote?: string
}

export function App({ signIn, verifyOneTimeCode, resendOneTimeCode, footnote }: AppProps) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:max-w-md sm:p-10">
        <SignInFlow signIn={signIn} verifyOneTimeCode={verifyOneTimeCode} resendOneTimeCode={resendOneTimeCode} />
      </section>
      {footnote && <p className="mt-6 max-w-sm text-center text-xs text-slate-500 sm:max-w-md">{footnote}</p>}
    </main>
  )
}
