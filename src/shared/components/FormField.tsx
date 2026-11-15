import type { ReactNode } from 'react'
import { Label } from '@/shared/ui/label'

export interface FormControlProps {
  id: string
  'aria-invalid': boolean | undefined
  'aria-describedby': string | undefined
}

interface FormFieldProps {
  id: string
  label: string
  error?: string
  children: (controlProps: FormControlProps) => ReactNode
}

/** Label + control + error message, wired together for assistive technology. */
export function FormField({ id, label, error, children }: FormFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
