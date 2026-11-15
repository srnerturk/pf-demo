import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { FormField } from './FormField'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  id: string
  label: string
  options: readonly SelectOption[]
  /** The chosen option's value; `''` when nothing is chosen yet. */
  value: string
  onValueChange(value: string): void
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
}

/** A labelled pick-one list with its hint or error. */
export function SelectField({ id, label, options, value, onValueChange, placeholder, hint, error, disabled }: SelectFieldProps) {
  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      {(controlProps) => (
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger {...controlProps} className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent position="popper">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  )
}
