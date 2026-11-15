import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { otherTheme } from '../domain/theme'
import { useTheme } from './useTheme'

/** Switches between the light and dark theme. Shows the icon of the theme it switches to. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const label = `Switch to ${otherTheme(theme)} theme`

  return (
    <Button type="button" variant="ghost" size="icon" aria-label={label} title={label} onClick={toggleTheme}>
      {theme === 'dark' ? <SunIcon aria-hidden /> : <MoonIcon aria-hidden />}
    </Button>
  )
}
