import { useI18n } from '@/shared/i18n/useI18n'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { FormField } from './FormField'

export interface PhoneValue {
  countryCode: string
  nationalNumber: string
}

export interface CountryCode {
  /** Dialling prefix, e.g. `+90`. */
  code: string
  /** Short country name shown beside the prefix, e.g. `TR`. */
  country: string
}

interface PhoneFieldProps {
  id: string
  label: string
  countryCodes: readonly CountryCode[]
  value: PhoneValue
  onChange(value: PhoneValue): void
  placeholder?: string
  hint?: string
  error?: string
}

/** A phone number: dialling prefix and number side by side, read as one field. */
export function PhoneField({ id, label, countryCodes, value, onChange, placeholder, hint, error }: PhoneFieldProps) {
  const { t } = useI18n()

  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      {(controlProps) => (
        <div className="flex">
          <Select value={value.countryCode} onValueChange={(countryCode) => onChange({ ...value, countryCode })}>
            <SelectTrigger aria-label={t('form.countryCode')} aria-invalid={controlProps['aria-invalid']} className="rounded-r-none border-r-0 tabular-nums">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {countryCodes.map(({ code, country }) => (
                <SelectItem key={code} value={code}>
                  <span className="text-muted-foreground">{country}</span> {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            {...controlProps}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder={placeholder}
            value={value.nationalNumber}
            onChange={(event) => onChange({ ...value, nationalNumber: event.target.value })}
            className="rounded-l-none tabular-nums"
          />
        </div>
      )}
    </FormField>
  )
}
