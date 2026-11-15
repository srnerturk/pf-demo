import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { ResendOneTimeCode } from '../application/resend-one-time-code'
import { OneTimeCodeRejectedError, type VerifyOneTimeCode } from '../application/verify-one-time-code'
import type { Session, SignInChallenge } from '../domain/authentication'
import { ONE_TIME_CODE_LENGTH, validateOneTimeCode, type OneTimeCodeViolation } from '../domain/one-time-code'
import { primaryButtonClassName, subtleButtonClassName } from './button-styles'
import { ArrowLeftIcon } from './icons'
import { emptyOneTimeCode } from './one-time-code-digits'
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
  } = useForm<OneTimeCodeFormValues>({ defaultValues: { digits: emptyOneTimeCode() } })

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
            <span className="font-medium text-slate-900">{challenge.email}</span>. Enter it below to finish signing in.
          </>
        }
      />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-medium text-slate-700">Verification code</legend>
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
            <p id={ERROR_ID} className="text-sm text-red-600">
              {fieldError}
            </p>
          )}
        </fieldset>

        {!fieldError && formError && (
          <p id={ERROR_ID} role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className={primaryButtonClassName}>
          {isSubmitting ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-4">
        <ResendCode onResend={() => resendOneTimeCode(challenge)} cooldownSeconds={resendCooldownSeconds} />
        <button
          type="button"
          onClick={onChangeEmail}
          className={subtleButtonClassName}
        >
          <ArrowLeftIcon />
          Use a different email
        </button>
      </div>
    </>
  )
}
