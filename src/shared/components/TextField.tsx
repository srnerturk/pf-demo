import type { ComponentProps } from 'react'
import { Input } from '@/shared/ui/input'
import { FormField } from './FormField'

interface TextFieldProps extends Omit<ComponentProps<typeof Input>, 'id'> {
  id: string
  label: string
  hint?: string
  error?: string
}

/** A labelled single-line text input with its hint or error. Works with React Hook Form's `register`. */
export function TextField({ id, label, hint, error, ...inputProps }: TextFieldProps) {
  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      {(controlProps) => <Input {...inputProps} {...controlProps} />}
    </FormField>
  )
}
