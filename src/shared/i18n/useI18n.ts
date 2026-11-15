import { useContext } from 'react'
import { I18nContext, type I18nContextValue } from './i18n-context'

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside an I18nProvider')
  return value
}
