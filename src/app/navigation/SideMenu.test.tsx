import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FolderIcon } from 'lucide-react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { Locale } from '@/shared/i18n/locale'
import { TestI18nProvider } from '@/test/i18n'
import type { MenuSection } from './menu'
import { SideMenu } from './SideMenu'

const sections: MenuSection[] = [
  {
    labelKey: 'menu.accessControl.title',
    icon: FolderIcon,
    items: [
      { labelKey: 'menu.accessControl.users', path: '/access-control/users' },
      { labelKey: 'menu.accessControl.roles', path: '/access-control/roles' },
    ],
  },
  {
    labelKey: 'menu.configuration.title',
    icon: FolderIcon,
    items: [{ labelKey: 'menu.configuration.currencies', path: '/configuration/currencies' }],
  },
]

function renderMenu({
  at = '/',
  onNavigate = vi.fn<() => void>(),
  locale = 'tr',
}: { at?: string; onNavigate?: () => void; locale?: Locale } = {}) {
  const user = userEvent.setup()
  render(
    <TestI18nProvider locale={locale}>
      <MemoryRouter initialEntries={[at]}>
        <SideMenu sections={sections} onNavigate={onNavigate} />
      </MemoryRouter>
    </TestI18nProvider>,
  )
  return { user, onNavigate }
}

const section = (name: string) => screen.getByRole('button', { name })

describe('SideMenu', () => {
  it('lists every section, folded away', () => {
    renderMenu()

    expect(section('Giriş Kontrolü')).toHaveAttribute('aria-expanded', 'false')
    expect(section('Yapılandırma')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('unfolds a section to show its pages, and folds it again', async () => {
    const { user } = renderMenu()

    await user.click(section('Giriş Kontrolü'))
    expect(section('Giriş Kontrolü')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Kullanıcı Yönetimi' })).toHaveAttribute('href', '/access-control/users')
    expect(screen.getByRole('link', { name: 'Roller' })).toBeInTheDocument()

    await user.click(section('Giriş Kontrolü'))
    expect(screen.queryByRole('link', { name: 'Roller' })).not.toBeInTheDocument()
  })

  it('opens on the section of the current page and marks that page', () => {
    renderMenu({ at: '/configuration/currencies' })

    expect(section('Yapılandırma')).toHaveAttribute('aria-expanded', 'true')
    expect(section('Giriş Kontrolü')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('link', { name: 'Para Birimleri' })).toHaveAttribute('aria-current', 'page')
  })

  it('tells its frame when the person picks a page', async () => {
    const { user, onNavigate } = renderMenu()

    await user.click(section('Giriş Kontrolü'))
    await user.click(screen.getByRole('link', { name: 'Roller' }))

    expect(onNavigate).toHaveBeenCalledOnce()
  })

  it('names its sections and pages in the interface language', () => {
    renderMenu({ at: '/configuration/currencies', locale: 'en' })

    expect(screen.getByRole('navigation', { name: 'Main menu' })).toBeInTheDocument()
    expect(section('Configuration')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Currencies' })).toBeInTheDocument()
  })
})
