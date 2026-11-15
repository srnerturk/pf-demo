import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TestI18nProvider } from '@/test/i18n'
import { DataTable, type DataTableColumn, type RowId, type TableSort } from './DataTable'

interface Fruit {
  id: number
  name: string
}

const fruits: Fruit[] = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
]

const columns: DataTableColumn<Fruit>[] = [
  { id: 'id', header: 'ID', cell: (fruit) => fruit.id, sortable: true },
  { id: 'name', header: 'Name', cell: (fruit) => fruit.name },
]

function Harness({ rows = fruits, loading = false, onSortChange = vi.fn<(sort: TableSort) => void>() }) {
  const [selected, setSelected] = useState<ReadonlySet<RowId>>(new Set())
  return (
    <TestI18nProvider>
      <DataTable
        label="Fruits"
        columns={columns}
        rows={rows}
        getRowId={(fruit) => fruit.id}
        getRowLabel={(fruit) => fruit.name}
        sort={{ columnId: 'id', direction: 'asc' }}
        onSortChange={onSortChange}
        selectedIds={selected}
        onSelectedIdsChange={setSelected}
        loading={loading}
        emptyState="No fruit."
      />
      <output aria-label="Selected">{[...selected].join(',')}</output>
    </TestI18nProvider>
  )
}

const table = () => screen.getByRole('table', { name: 'Fruits' })
const selected = () => screen.getByRole('status', { name: 'Selected' })

describe('DataTable', () => {
  it('shows one row per record under the column headers', () => {
    render(<Harness />)

    const rows = within(table()).getAllByRole('row')
    expect(within(rows[0]).getByRole('columnheader', { name: /ID/ })).toBeInTheDocument()
    expect(within(rows[1]).getByRole('cell', { name: 'Apple' })).toBeInTheDocument()
    expect(within(rows[2]).getByRole('cell', { name: 'Banana' })).toBeInTheDocument()
  })

  it('marks the sorted column and flips its direction when pressed again', async () => {
    const onSortChange = vi.fn<(sort: TableSort) => void>()
    render(<Harness onSortChange={onSortChange} />)
    const idHeader = screen.getByRole('columnheader', { name: /ID/ })

    expect(idHeader).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByRole('columnheader', { name: 'Name' })).not.toHaveAttribute('aria-sort')

    await userEvent.click(within(idHeader).getByRole('button'))

    expect(onSortChange).toHaveBeenCalledWith({ columnId: 'id', direction: 'desc' })
  })

  it('selects single rows, or every row at once', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('checkbox', { name: 'Satırı seç: Banana' }))
    expect(selected()).toHaveTextContent('2')
    expect(screen.getByRole('checkbox', { name: 'Tümünü seç' })).toHaveAttribute('aria-checked', 'mixed')

    await user.click(screen.getByRole('checkbox', { name: 'Tümünü seç' }))
    expect(selected()).toHaveTextContent('2,1')

    await user.click(screen.getByRole('checkbox', { name: 'Tümünü seç' }))
    expect(selected()).toHaveTextContent('')
  })

  it('shows placeholder rows while the first records load', () => {
    render(<Harness rows={[]} loading />)

    expect(table()).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('No fruit.')).not.toBeInTheDocument()
  })

  it('says so when there is nothing to show', () => {
    render(<Harness rows={[]} />)

    expect(screen.getByText('No fruit.')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Tümünü seç' })).toBeDisabled()
  })
})
