import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Locale } from '@/shared/i18n/locale'
import type { SaveFile } from '@/shared/lib/save-file'
import { TestI18nProvider } from '@/test/i18n'
import type { ExportUsers } from '../application/export-users'
import type { ListUsers } from '../application/list-users'
import type { User } from '../domain/user'
import { testUseCases, testUsers } from './test-directory'
import { UserManagement } from './UserManagement'

function renderScreen({
  users = testUsers(23),
  listUsers,
  exportUsers,
  locale = 'tr',
}: { users?: User[]; listUsers?: ListUsers; exportUsers?: ExportUsers; locale?: Locale } = {}) {
  const user = userEvent.setup()
  const useCases = testUseCases(users)
  const saveFile = vi.fn<SaveFile>()
  render(
    <TestI18nProvider locale={locale}>
      <UserManagement
        {...useCases}
        listUsers={listUsers ?? useCases.listUsers}
        exportUsers={exportUsers ?? useCases.exportUsers}
        saveFile={saveFile}
        searchDelayMs={0}
      />
    </TestI18nProvider>,
  )
  return { user, saveFile, ...useCases }
}

const table = () => screen.getByRole('table', { name: 'Kullanıcı Listesi' })
const dataRows = () => within(table()).getAllByRole('row').slice(1)
const firstCellIds = () => dataRows().map((row) => within(row).getAllByRole('cell')[1].textContent)

async function waitForRows() {
  await within(table()).findAllByRole('checkbox', { name: /Satırı seç/ })
}

describe('UserManagement', () => {
  it('lists the newest users first, a page at a time, with the total', async () => {
    renderScreen()
    await waitForRows()

    expect(firstCellIds()).toEqual(['23', '22', '21', '20', '19', '18', '17', '16', '15', '14'])
    expect(screen.getByText('Toplam 23 kayıt')).toBeInTheDocument()
    const newest = dataRows()[0]
    expect(newest).toHaveTextContent('User23 Test')
    expect(newest).toHaveTextContent('user23@example.com')
    expect(newest).toHaveTextContent('Aktif')
  })

  it('finds users by what is typed in the search box', async () => {
    const { user } = renderScreen()
    await waitForRows()

    await user.type(screen.getByRole('searchbox', { name: 'Kullanıcı ara' }), 'user7@')

    await vi.waitFor(() => expect(firstCellIds()).toEqual(['7']))
    expect(screen.getByText('Toplam 1 kayıt')).toBeInTheDocument()
  })

  it('says so when nobody matches the search', async () => {
    const { user } = renderScreen()
    await waitForRows()

    await user.type(screen.getByRole('searchbox', { name: 'Kullanıcı ara' }), 'nobody')

    await vi.waitFor(() => expect(screen.getByText('Aramanızla eşleşen kullanıcı yok.')).toBeInTheDocument())
  })

  it('pages through the results', async () => {
    const { user } = renderScreen()
    await waitForRows()

    await user.click(screen.getByRole('button', { name: 'Sayfa 3' }))
    await vi.waitFor(() => expect(firstCellIds()).toEqual(['3', '2', '1']))

    await user.click(screen.getByRole('combobox', { name: 'Sayfa başına' }))
    await user.click(screen.getByRole('option', { name: '25' }))
    await vi.waitFor(() => expect(dataRows()).toHaveLength(23))
  })

  it('offers no column sorting, since the users service lists in its own order', async () => {
    renderScreen()
    await waitForRows()

    for (const header of within(table()).getAllByRole('columnheader')) {
      expect(within(header).queryByRole('button')).not.toBeInTheDocument()
    }
  })

  it('deactivates the chosen users together', async () => {
    const { user } = renderScreen({ users: testUsers(3) })
    await waitForRows()

    await user.click(screen.getByRole('checkbox', { name: 'Satırı seç: User3 Test' }))
    await user.click(screen.getByRole('checkbox', { name: 'Satırı seç: User1 Test' }))
    expect(screen.getByText('2 kullanıcı seçildi')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Pasifleştir' }))

    expect(await screen.findByRole('status')).toHaveTextContent('2 kullanıcı güncellendi.')
    await vi.waitFor(() => expect(dataRows().map((row) => row.textContent?.includes('Pasif'))).toEqual([true, false, true]))
    expect(screen.queryByText(/kullanıcı seçildi/)).not.toBeInTheDocument()
  })

  it('exports every matching user as CSV', async () => {
    const { user, saveFile } = renderScreen({ users: testUsers(12) })
    await waitForRows()

    await user.type(screen.getByRole('searchbox', { name: 'Kullanıcı ara' }), 'user1')
    await vi.waitFor(() => expect(firstCellIds()).toHaveLength(4))
    await user.click(screen.getByRole('button', { name: 'CSV olarak dışa aktar' }))

    await vi.waitFor(() => expect(saveFile).toHaveBeenCalledOnce())
    const file = saveFile.mock.calls[0][0]
    const lines = file.content.replace('﻿', '').split('\r\n')
    expect(file.name).toMatch(/^kullanicilar-\d{4}-\d{2}-\d{2}\.csv$/)
    expect(file.mediaType).toBe('text/csv;charset=utf-8')
    expect(lines[0]).toBe('ID,İsim,Soyad,E-posta,Durum,Roller,Oluşturulma,Güncellenme')
    expect(lines.slice(1).map((line) => line.split(',')[0])).toEqual(['12', '11', '10', '1'])
    expect(lines[1]).toContain('Aktif,"ADMIN_ROLE, HR, TECH",2026-01-12 09:00')
  })

  it('reports when the export fails', async () => {
    const { user } = renderScreen({ exportUsers: vi.fn<ExportUsers>().mockRejectedValue(new Error('offline')) })
    await waitForRows()

    await user.click(screen.getByRole('button', { name: 'CSV olarak dışa aktar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Dışa aktarılamadı. Lütfen tekrar deneyin.')
  })

  it('reports when the users cannot be loaded and tries again on request', async () => {
    const working = testUseCases(testUsers(2)).listUsers
    const listUsers = vi.fn<ListUsers>().mockRejectedValueOnce(new Error('offline')).mockImplementation(working)
    const { user } = renderScreen({ listUsers })

    expect(await screen.findByRole('alert')).toHaveTextContent('Kullanıcılar yüklenemedi.')
    await user.click(screen.getByRole('button', { name: 'Tekrar dene' }))

    await waitForRows()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('speaks the interface language', async () => {
    renderScreen({ locale: 'en' })

    expect(await screen.findByRole('table', { name: 'User List' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add user' })).toBeInTheDocument()
    expect(await screen.findByText('23 records in total')).toBeInTheDocument()
  })
})
