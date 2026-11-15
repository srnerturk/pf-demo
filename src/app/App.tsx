import { InfoIcon, LockKeyholeIcon } from 'lucide-react'
import type { ResendOneTimeCode } from '@/features/auth/application/resend-one-time-code'
import type { SignIn } from '@/features/auth/application/sign-in'
import type { VerifyOneTimeCode } from '@/features/auth/application/verify-one-time-code'
import { SignInFlow } from '@/features/auth/ui/SignInFlow'
import { Card, CardContent } from '@/shared/ui/card'

interface AppProps {
  signIn: SignIn
  verifyOneTimeCode: VerifyOneTimeCode
  resendOneTimeCode: ResendOneTimeCode
  footnote?: string
}

export function App({ signIn, verifyOneTimeCode, resendOneTimeCode, footnote }: AppProps) {
  return (
    <main className="relative isolate flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-radial-[ellipse_at_top] from-primary/12 to-transparent to-70%"
      />

      <div className="mb-8 flex items-center gap-2.5 text-lg font-semibold tracking-tight">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <LockKeyholeIcon className="size-[18px]" aria-hidden />
        </span>
        pf-demo
      </div>

      <Card className="w-full max-w-sm overflow-hidden py-0 sm:max-w-md">
        <CardContent className="p-6 sm:p-10">
          <SignInFlow signIn={signIn} verifyOneTimeCode={verifyOneTimeCode} resendOneTimeCode={resendOneTimeCode} />
        </CardContent>
      </Card>

      {footnote && (
        <p className="mt-6 flex max-w-sm items-start gap-2 text-xs leading-relaxed text-muted-foreground sm:max-w-md">
          <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden />
          {footnote}
        </p>
      )}
    </main>
  )
}
