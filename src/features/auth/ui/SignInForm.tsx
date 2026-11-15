import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CircleAlertIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { FormField } from '@/shared/components/FormField'
import { SubmitButton } from '@/shared/components/SubmitButton'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { CredentialsRejectedError, type SignIn } from '../application/sign-in'
import type { SignInChallenge } from '../domain/authentication'
import {
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validatePassword,
  type Credentials,
  type CredentialsViolation,
} from '../domain/credentials'
import { ScreenHeader } from './ScreenHeader'

const VIOLATION_MESSAGES: Record<keyof Credentials, Partial<Record<CredentialsViolation, string>>> = {
  email: {
    required: 'Enter your email address.',
    'invalid-email': 'Enter a valid email address, like name@company.com.',
  },
  password: {
    required: 'Enter your password.',
    'too-short': `Use at least ${PASSWORD_MIN_LENGTH} characters.`,
  },
}

const REJECTED_MESSAGE = 'That email and password don’t match an account. Check them and try again.'
const FAILURE_MESSAGE = 'We couldn’t sign you in right now. Check your connection and try again.'

/** Adapts a domain rule to React Hook Form's `validate`: `true` when valid, otherwise the message to show. */
function ruleFor(field: keyof Credentials, rule: (value: string) => CredentialsViolation | null) {
  return (value: string) => {
    const violation = rule(value)
    return violation === null ? true : (VIOLATION_MESSAGES[field][violation] ?? violation)
  }
}

interface SignInFormProps {
  signIn: SignIn
  onChallengeIssued: (challenge: SignInChallenge) => void
}

export function SignInForm({ signIn, onChallengeIssued }: SignInFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async (credentials) => {
    try {
      onChallengeIssued(await signIn(credentials))
    } catch (error) {
      const message = error instanceof CredentialsRejectedError ? REJECTED_MESSAGE : FAILURE_MESSAGE
      setError('root.signInFailure', { message })
    }
  })

  return (
    <>
      <ScreenHeader title="Sign in" description="Welcome back. Enter your details to continue." />

      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <FormField id="sign-in-email" label="Email" error={errors.email?.message}>
          {(controlProps) => (
            <Input
              {...controlProps}
              {...register('email', { validate: ruleFor('email', validateEmail) })}
              type="email"
              autoComplete="username"
              placeholder="name@company.com"
              className="h-10"
            />
          )}
        </FormField>

        <FormField id="sign-in-password" label="Password" error={errors.password?.message}>
          {(controlProps) => (
            <div className="relative">
              <Input
                {...controlProps}
                {...register('password', { validate: ruleFor('password', validatePassword) })}
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                className="h-10 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                aria-controls={controlProps.id}
                className="absolute inset-y-0.5 right-0.5 h-auto text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
            </div>
          )}
        </FormField>

        {errors.root?.signInFailure && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{errors.root.signInFailure.message}</AlertDescription>
          </Alert>
        )}

        <SubmitButton pending={isSubmitting} pendingLabel="Signing in…" size="lg" className="w-full">
          Sign in
        </SubmitButton>
      </form>
    </>
  )
}
