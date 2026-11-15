import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FormField, formControlClassName } from '@/shared/ui/FormField'
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
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <FormField id="contact-name" label="Name" error={errors.name?.message}>
        {(controlProps) => (
          <input
            {...controlProps}
            {...register('name', { validate: ruleFor('name', validateName) })}
            type="text"
            autoComplete="name"
            className={formControlClassName}
          />
        )}
      </FormField>

      <FormField id="contact-email" label="Email" error={errors.email?.message}>
        {(controlProps) => (
          <input
            {...controlProps}
            {...register('email', { validate: ruleFor('email', validateEmail) })}
            type="email"
            autoComplete="email"
            className={formControlClassName}
          />
        )}
      </FormField>

      <FormField id="contact-message" label="Message" error={errors.message?.message}>
        {(controlProps) => (
          <textarea
            {...controlProps}
            {...register('message', { validate: ruleFor('message', validateMessage) })}
            rows={5}
            className={formControlClassName}
          />
        )}
      </FormField>

      {errors.root?.sendFailure && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.root.sendFailure.message}
        </p>
      )}
      {wasSent && (
        <output className="block rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Thanks! Your message has been sent.
        </output>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
