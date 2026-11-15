import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TestI18nProvider } from '@/test/i18n'
import { TablePagination } from './TablePagination'

function renderPagination(page = 1) {
  const onPageChange = vi.fn<(page: number) => void>()
  const onPageSizeChange = vi.fn<(size: number) => void>()
  const user = userEvent.setup()
  render(
    <TestI18nProvider>
      <TablePagination
        page={page}
        pageSize={10}
        pageSizes={[10, 25, 50]}
        total={119}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </TestI18nProvider>,
  )
  return { user, onPageChange, onPageSizeChange }
}

describe('TablePagination', () => {
  it('says how many records there are and which page is open', () => {
    renderPagination(3)

    expect(screen.getByText('Toplam 119 kayıt')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sayfa 3' })).toHaveAttribute('aria-current', 'page')
  })

  it('moves to another page, the previous one or the next one', async () => {
    const { user, onPageChange } = renderPagination(3)
    const pages = screen.getByRole('navigation', { name: 'Sayfalama' })

    await user.click(within(pages).getByRole('button', { name: 'Sayfa 12' }))
    await user.click(within(pages).getByRole('button', { name: 'Önceki' }))
    await user.click(within(pages).getByRole('button', { name: 'Sonraki' }))

    expect(onPageChange.mock.calls).toEqual([[12], [2], [4]])
  })

  it('cannot go before the first page or past the last', () => {
    renderPagination(1)
    expect(screen.getByRole('button', { name: 'Önceki' })).toBeDisabled()
  })

  it('changes how many rows a page shows', async () => {
    const { user, onPageSizeChange } = renderPagination()

    await user.click(screen.getByRole('combobox', { name: 'Sayfa başına' }))
    await user.click(screen.getByRole('option', { name: '25' }))

    expect(onPageSizeChange).toHaveBeenCalledWith(25)
  })
})
