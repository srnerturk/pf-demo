import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ArrowLeftIcon, CircleAlertIcon } from 'lucide-react'
import { SubmitButton } from '@/shared/components/SubmitButton'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import type { ResendOneTimeCode } from '../application/resend-one-time-code'
import { OneTimeCodeRejectedError, type VerifyOneTimeCode } from '../application/verify-one-time-code'
import type { Session, SignInChallenge } from '../domain/authentication'
import { ONE_TIME_CODE_LENGTH, validateOneTimeCode, type OneTimeCodeViolation } from '../domain/one-time-code'
import { emptyOneTimeCode, oneTimeCodeDigits } from './one-time-code-digits'
import { OneTimeCodeInput } from './OneTimeCodeInput'
import { ResendCode } from './ResendCode'
import { ScreenHeader } from './ScreenHeader'

const VIOLATION_MESSAGES: Record<OneTimeCodeViolation, string> = {
  required: `Enter the ${ONE_TIME_CODE_LENGTH}-digit code from your email.`,
  'wrong-length': `Enter all ${ONE_TIME_CODE_LENGTH} digits.`,
  'not-digits': 'Use digits only.',
}

const REJECTED_MESSAGE = 'That code isn’t right. Check your email and try again.'
const FAILURE_MESSAGE = 'We couldn’t verify the code right now. Check your connection and try again.'

const ERROR_ID = 'one-time-code-error'

interface OneTimeCodeFormValues {
  digits: string[]
}

function validateDigits(digits: string[]): true | string {
  const violation = validateOneTimeCode(digits.join(''))
  return violation === null ? true : VIOLATION_MESSAGES[violation]
}

interface OneTimeCodeFormProps {
  challenge: SignInChallenge
  verifyOneTimeCode: VerifyOneTimeCode
  resendOneTimeCode: ResendOneTimeCode
  resendCooldownSeconds: number
  onVerified: (session: Session) => void
  onChangeEmail: () => void
}

export function OneTimeCodeForm({
  challenge,
  verifyOneTimeCode,
  resendOneTimeCode,
  resendCooldownSeconds,
  onVerified,
  onChangeEmail,
}: OneTimeCodeFormProps) {
  // A fresh input (and focus on its first box) after each rejected attempt.
  const [attempt, setAttempt] = useState(0)
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OneTimeCodeFormValues>({ defaultValues: { digits: oneTimeCodeDigits(challenge.revealedCode) } })

  const onSubmit = handleSubmit(async ({ digits }) => {
    try {
      onVerified(await verifyOneTimeCode(challenge, digits.join('')))
    } catch (error) {
      if (error instanceof OneTimeCodeRejectedError) {
        reset({ digits: emptyOneTimeCode() })
        setAttempt((count) => count + 1)
        setError('root.verificationFailure', { message: REJECTED_MESSAGE })
      } else {
        setError('root.verificationFailure', { message: FAILURE_MESSAGE })
      }
    }
  })

  const fieldError = errors.digits?.message
  const formError = errors.root?.verificationFailure?.message
  const errorMessage = fieldError ?? formError

  return (
    <>
      <ScreenHeader
        title="Check your email"
        description={
          <>
            We sent a {ONE_TIME_CODE_LENGTH}-digit code to{' '}
            <span className="font-medium text-foreground">{challenge.email}</span>. Enter it below to finish signing in.
          </>
        }
      />

      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm leading-none font-medium">Verification code</legend>
          <Controller
            control={control}
            name="digits"
            rules={{ validate: validateDigits }}
            render={({ field }) => (
              <OneTimeCodeInput
                key={attempt}
                digits={field.value}
                onChange={field.onChange}
                invalid={errorMessage !== undefined}
                disabled={isSubmitting}
                aria-describedby={errorMessage ? ERROR_ID : undefined}
                focusFirstOnMount
              />
            )}
          />
          {fieldError && (
            <p id={ERROR_ID} className="text-sm text-destructive">
              {fieldError}
            </p>
          )}
        </fieldset>

        {!fieldError && formError && (
          <Alert id={ERROR_ID} variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <SubmitButton pending={isSubmitting} pendingLabel="Verifying…" size="lg" className="w-full">
          Verify
        </SubmitButton>
      </form>

      <div className="mt-6 flex flex-col items-center gap-4">
        <ResendCode onResend={() => resendOneTimeCode(challenge)} cooldownSeconds={resendCooldownSeconds} />
        <Button type="button" variant="ghost" size="sm" onClick={onChangeEmail} className="text-muted-foreground">
          <ArrowLeftIcon />
          Use a different email
        </Button>
      </div>
    </>
  )
}
