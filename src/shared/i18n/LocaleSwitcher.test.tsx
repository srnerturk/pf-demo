import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Locale } from './locale'
import type { LocalePreferenceStore } from './locale-preference-store'
import { I18nProvider } from './I18nProvider'
import { LocaleSwitcher } from './LocaleSwitcher'
import { useI18n } from './useI18n'

class FakeLocalePreferenceStore implements LocalePreferenceStore {
  stored: Locale | null

  constructor(stored: Locale | null = null) {
    this.stored = stored
  }

  load() {
    return this.stored
  }

  save(locale: Locale) {
    this.stored = locale
  }
}

function Greeting() {
  const { t } = useI18n()
  return <h1>{t('layout.mainMenu')}</h1>
}

function renderSwitcher({ store = new FakeLocalePreferenceStore(), preferredLanguages = [] as string[] } = {}) {
  const user = userEvent.setup()
  render(
    <I18nProvider store={store} preferredLanguages={preferredLanguages}>
      <Greeting />
      <LocaleSwitcher />
    </I18nProvider>,
  )
  return { user, store }
}

describe('LocaleSwitcher', () => {
  afterEach(() => {
    document.documentElement.lang = ''
  })

  it('starts in Turkish when nothing else is known', () => {
    renderSwitcher()

    expect(screen.getByRole('heading', { name: 'Ana menü' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('tr')
  })

  it('starts in the language the person chose before', () => {
    renderSwitcher({ store: new FakeLocalePreferenceStore('en'), preferredLanguages: ['tr-TR'] })

    expect(screen.getByRole('heading', { name: 'Main menu' })).toBeInTheDocument()
  })

  it('switches the whole interface to the chosen language and remembers it', async () => {
    const { user, store } = renderSwitcher()

    await user.click(screen.getByRole('combobox', { name: 'Dil' }))
    await user.click(screen.getByRole('option', { name: 'English' }))

    expect(screen.getByRole('heading', { name: 'Main menu' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveTextContent('EN')
    expect(document.documentElement.lang).toBe('en')
    expect(store.stored).toBe('en')
  })
})

describe('useI18n', () => {
  it('explains that it needs an I18nProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Probe() {
      useI18n()
      return null
    }

    expect(() => render(<Probe />)).toThrow('useI18n must be used inside an I18nProvider')
  })
})
