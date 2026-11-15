import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react'
import { FormField } from '@/shared/components/FormField'
import { SubmitButton } from '@/shared/components/SubmitButton'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import type { SendContactMessage } from '../application/send-contact-message'
import {
  MESSAGE_MIN_LENGTH,
  validateEmail,
  validateMessage,
  validateName,
  type ContactMessage,
  type ContactMessageViolation,
} from '../domain/contact-message'

const VIOLATION_MESSAGES: Record<keyof ContactMessage, Partial<Record<ContactMessageViolation, string>>> = {
  name: { required: 'Please enter your name.' },
  email: {
    required: 'Please enter your email address.',
    'invalid-email': 'Please enter a valid email address.',
  },
  message: {
    required: 'Please enter a message.',
    'too-short': `Your message needs at least ${MESSAGE_MIN_LENGTH} characters.`,
  },
}

const SEND_FAILURE_MESSAGE = "We couldn't send your message. Please try again."

/** Adapts a domain rule to React Hook Form's `validate`: `true` when valid, otherwise the message to show. */
function ruleFor(field: keyof ContactMessage, rule: (value: string) => ContactMessageViolation | null) {
  return (value: string) => {
    const violation = rule(value)
    return violation === null ? true : (VIOLATION_MESSAGES[field][violation] ?? violation)
  }
}

interface ContactFormProps {
  sendContactMessage: SendContactMessage
}

export function ContactForm({ sendContactMessage }: ContactFormProps) {
  const [wasSent, setWasSent] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessage>({
    defaultValues: { name: '', email: '', message: '' },
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit(async (contactMessage) => {
    setWasSent(false)
    try {
      await sendContactMessage(contactMessage)
      reset()
      setWasSent(true)
    } catch {
      setError('root.sendFailure', { message: SEND_FAILURE_MESSAGE })
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormField id="contact-name" label="Name" error={errors.name?.message}>
        {(controlProps) => (
          <Input
            {...controlProps}
            {...register('name', { validate: ruleFor('name', validateName) })}
            type="text"
            autoComplete="name"
          />
        )}
      </FormField>

      <FormField id="contact-email" label="Email" error={errors.email?.message}>
        {(controlProps) => (
          <Input
            {...controlProps}
            {...register('email', { validate: ruleFor('email', validateEmail) })}
            type="email"
            autoComplete="email"
          />
        )}
      </FormField>

      <FormField id="contact-message" label="Message" error={errors.message?.message}>
        {(controlProps) => (
          <Textarea
            {...controlProps}
            {...register('message', { validate: ruleFor('message', validateMessage) })}
            rows={5}
          />
        )}
      </FormField>

      {errors.root?.sendFailure && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{errors.root.sendFailure.message}</AlertDescription>
        </Alert>
      )}
      {wasSent && (
        <output className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <CircleCheckIcon className="size-4 shrink-0" aria-hidden />
          Thanks! Your message has been sent.
        </output>
      )}

      <SubmitButton pending={isSubmitting} pendingLabel="Sending…">
        Send message
      </SubmitButton>
    </form>
  )
}
