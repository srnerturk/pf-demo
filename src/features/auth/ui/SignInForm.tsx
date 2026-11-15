import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { CircleAlertIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { FormField } from '@/shared/components/FormField'
import { SubmitButton } from '@/shared/components/SubmitButton'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import type { RequestCaptcha } from '../application/request-captcha'
import { CaptchaRejectedError, CredentialsRejectedError, type SignIn } from '../application/sign-in'
import type { SignInChallenge } from '../domain/authentication'
import { validateCaptchaText } from '../domain/captcha'
import {
  validateEmail,
  validatePassword,
  type Credentials,
  type CredentialsViolation,
} from '../domain/credentials'
import { CaptchaField } from './CaptchaField'
import { ScreenHeader } from './ScreenHeader'
import { useCaptcha } from './useCaptcha'

interface SignInFormValues extends Credentials {
  captchaText: string
  remember: boolean
}

const VIOLATION_MESSAGES: Record<keyof Credentials, Partial<Record<CredentialsViolation, string>>> = {
  email: {
    required: 'Enter your email address.',
    'invalid-email': 'Enter a valid email address, like name@company.com.',
  },
  password: {
    required: 'Enter your password.',
  },
}

const CAPTCHA_MESSAGES = {
  required: 'Enter the characters in the picture.',
  unavailable: 'Load a picture, then enter its characters.',
}

const REJECTED_MESSAGE = 'That email and password don’t match an account. Check them and try again.'
const CAPTCHA_REJECTED_MESSAGE = 'The security code didn’t match the picture. Enter the characters in the new one.'
const FAILURE_MESSAGE = 'We couldn’t sign you in right now. Check your connection and try again.'

function failureMessage(error: unknown): string {
  if (error instanceof CredentialsRejectedError) return REJECTED_MESSAGE
  if (error instanceof CaptchaRejectedError) return CAPTCHA_REJECTED_MESSAGE
  return FAILURE_MESSAGE
}

/** Adapts a domain rule to React Hook Form's `validate`: `true` when valid, otherwise the message to show. */
function ruleFor(field: keyof Credentials, rule: (value: string) => CredentialsViolation | null) {
  return (value: string) => {
    const violation = rule(value)
    return violation === null ? true : (VIOLATION_MESSAGES[field][violation] ?? violation)
  }
}

interface SignInFormProps {
  signIn: SignIn
  requestCaptcha: RequestCaptcha
  onChallengeIssued: (challenge: SignInChallenge) => void
}

export function SignInForm({ signIn, requestCaptcha, onChallengeIssued }: SignInFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const captcha = useCaptcha(requestCaptcha)
  const {
    register,
    handleSubmit,
    setError,
    resetField,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    defaultValues: { email: '', password: '', captchaText: '', remember: false },
    mode: 'onTouched',
  })

  /** A captcha answers one attempt only, so every new picture starts with an empty answer. */
  function showNewCaptcha() {
    resetField('captchaText')
    captcha.refresh()
  }

  const onSubmit = handleSubmit(async ({ email, password, captchaText, remember }) => {
    if (captcha.state.status !== 'ready') return
    try {
      onChallengeIssued(
        await signIn({
          credentials: { email, password },
          captcha: { key: captcha.state.captcha.key, text: captchaText },
          remember,
        }),
      )
    } catch (error) {
      setError('root.signInFailure', { message: failureMessage(error) })
      showNewCaptcha()
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

        <CaptchaField
          state={captcha.state}
          onRefresh={showNewCaptcha}
          error={errors.captchaText?.message}
          inputProps={register('captchaText', {
            validate: (text) => {
              if (captcha.state.status !== 'ready') return CAPTCHA_MESSAGES.unavailable
              return validateCaptchaText(text) === null ? true : CAPTCHA_MESSAGES.required
            },
          })}
        />

        <Controller
          control={control}
          name="remember"
          render={({ field: { value, onChange, ...field } }) => (
            <div className="flex items-center gap-2">
              <Checkbox {...field} id="sign-in-remember" checked={value} onCheckedChange={(checked) => onChange(checked === true)} />
              <Label htmlFor="sign-in-remember" className="font-normal">
                Remember me
              </Label>
            </div>
          )}
        />

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
