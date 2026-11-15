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
  /** Guidance shown below the control until there is an error. */
  hint?: string
  error?: string
  children: (controlProps: FormControlProps) => ReactNode
}

/** Label + control + hint or error message, wired together for assistive technology. */
export function FormField({ id, label, hint, error, children }: FormFieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
