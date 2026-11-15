import { LanguagesIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { isLocale, SUPPORTED_LOCALES } from './locale'
import { useI18n } from './useI18n'

/** Lets a person pick the interface language. Shows the short code; lists each language in its own name. */
export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <Select value={locale} onValueChange={(next) => isLocale(next) && setLocale(next)}>
      <SelectTrigger size="sm" aria-label={t('layout.language')} className="gap-1.5 border-transparent shadow-none">
        <LanguagesIcon aria-hidden />
        <SelectValue>{locale.toUpperCase()}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {SUPPORTED_LOCALES.map((option) => (
          <SelectItem key={option} value={option} lang={option}>
            {t(`locales.${option}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
