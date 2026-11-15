import { InfoIcon } from 'lucide-react'
import type { ResendOneTimeCode } from '@/features/auth/application/resend-one-time-code'
import type { SignIn } from '@/features/auth/application/sign-in'
import type { VerifyOneTimeCode } from '@/features/auth/application/verify-one-time-code'
import { SignInFlow } from '@/features/auth/ui/SignInFlow'
import { useSession } from '@/features/auth/ui/useSession'
import { Card, CardContent } from '@/shared/ui/card'
import { BrandMark } from '../components/BrandMark'

export interface SignInPageProps {
  signIn: SignIn
  verifyOneTimeCode: VerifyOneTimeCode
  resendOneTimeCode: ResendOneTimeCode
  footnote?: string
}

export function SignInPage({ signIn, verifyOneTimeCode, resendOneTimeCode, footnote }: SignInPageProps) {
  const { startSession } = useSession()

  return (
    <main className="relative isolate flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-radial-[ellipse_at_top] from-primary/12 to-transparent to-70%"
      />

      <BrandMark className="mb-8 text-lg" />

      <Card className="w-full max-w-sm overflow-hidden py-0 sm:max-w-md">
        <CardContent className="p-6 sm:p-10">
          <SignInFlow
            signIn={signIn}
            verifyOneTimeCode={verifyOneTimeCode}
            resendOneTimeCode={resendOneTimeCode}
            onSignedIn={startSession}
          />
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
