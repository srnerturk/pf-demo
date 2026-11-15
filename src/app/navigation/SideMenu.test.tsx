import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FolderIcon } from 'lucide-react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { MenuSection } from './menu'
import { SideMenu } from './SideMenu'

const sections: MenuSection[] = [
  {
    label: 'Reports',
    icon: FolderIcon,
    items: [
      { label: 'Daily balance', path: '/reports/daily-balance' },
      { label: 'Profit', path: '/reports/profit' },
    ],
  },
  {
    label: 'Settings',
    icon: FolderIcon,
    items: [{ label: 'Currencies', path: '/settings/currencies' }],
  },
]

function renderMenu({ at = '/', onNavigate = vi.fn<() => void>() } = {}) {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[at]}>
      <SideMenu sections={sections} onNavigate={onNavigate} />
    </MemoryRouter>,
  )
  return { user, onNavigate }
}

const section = (name: string) => screen.getByRole('button', { name })

describe('SideMenu', () => {
  it('lists every section, folded away', () => {
    renderMenu()

    expect(section('Reports')).toHaveAttribute('aria-expanded', 'false')
    expect(section('Settings')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('unfolds a section to show its pages, and folds it again', async () => {
    const { user } = renderMenu()

    await user.click(section('Reports'))
    expect(section('Reports')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Daily balance' })).toHaveAttribute('href', '/reports/daily-balance')
    expect(screen.getByRole('link', { name: 'Profit' })).toBeInTheDocument()

    await user.click(section('Reports'))
    expect(screen.queryByRole('link', { name: 'Profit' })).not.toBeInTheDocument()
  })

  it('opens on the section of the current page and marks that page', () => {
    renderMenu({ at: '/settings/currencies' })

    expect(section('Settings')).toHaveAttribute('aria-expanded', 'true')
    expect(section('Reports')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('link', { name: 'Currencies' })).toHaveAttribute('aria-current', 'page')
  })

  it('tells its frame when the person picks a page', async () => {
    const { user, onNavigate } = renderMenu()

    await user.click(section('Reports'))
    await user.click(screen.getByRole('link', { name: 'Profit' }))

    expect(onNavigate).toHaveBeenCalledOnce()
  })
})
