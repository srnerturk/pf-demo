import type { ReactNode } from 'react'

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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export const formControlClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm ' +
  'placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none ' +
  'aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/30'
