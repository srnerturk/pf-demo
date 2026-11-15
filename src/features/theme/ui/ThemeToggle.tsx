import { MoonIcon, SunIcon } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/button'
import { useTheme } from './useTheme'

/** Switches between the light and dark theme. Shows the icon of the theme it switches to. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const label = t(theme === 'dark' ? 'layout.switchToLight' : 'layout.switchToDark')

  return (
    <Button type="button" variant="ghost" size="icon" aria-label={label} title={label} onClick={toggleTheme}>
      {theme === 'dark' ? <SunIcon aria-hidden /> : <MoonIcon aria-hidden />}
    </Button>
  )
}
