import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/utils'
import { Checkbox } from '@/shared/ui/checkbox'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export type RowId = string | number

export interface DataTableColumn<Row> {
  id: string
  header: string
  cell(row: Row): ReactNode
  sortable?: boolean
  className?: string
}

export interface TableSort {
  columnId: string
  direction: 'asc' | 'desc'
}

interface DataTableProps<Row> {
  /** Accessible name of the table. */
  label: string
  columns: readonly DataTableColumn<Row>[]
  rows: readonly Row[]
  getRowId(row: Row): RowId
  /** Names a row for assistive technology, e.g. on its selection checkbox. */
  getRowLabel(row: Row): string
  sort?: TableSort
  onSortChange?(sort: TableSort): void
  /** Pass both selection props to show a checkbox per row. */
  selectedIds?: ReadonlySet<RowId>
  onSelectedIdsChange?(ids: ReadonlySet<RowId>): void
  loading?: boolean
  emptyState: ReactNode
  placeholderRows?: number
}

/**
 * A table of records the caller pages, sorts and filters (server-style): it shows the rows it
 * is given, reports sort and selection changes, and covers the loading and empty states.
 */
export function DataTable<Row>({
  label,
  columns,
  rows,
  getRowId,
  getRowLabel,
  sort,
  onSortChange,
  selectedIds,
  onSelectedIdsChange,
  loading = false,
  emptyState,
  placeholderRows = 5,
}: DataTableProps<Row>) {
  const { t } = useI18n()
  const selectable = selectedIds !== undefined && onSelectedIdsChange !== undefined
  const rowIds = rows.map(getRowId)
  const selectedOnPage = rowIds.filter((id) => selectedIds?.has(id)).length
  const allSelected = rows.length > 0 && selectedOnPage === rows.length
  const columnCount = columns.length + (selectable ? 1 : 0)

  const toggleAll = () => {
    const next = new Set(selectedIds)
    rowIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)))
    onSelectedIdsChange?.(next)
  }

  const toggleRow = (id: RowId) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectedIdsChange?.(next)
  }

  const showPlaceholders = loading && rows.length === 0

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table aria-label={label} aria-busy={loading || undefined} className={cn(loading && rows.length > 0 && 'opacity-60 transition-opacity')}>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {selectable && (
              <TableHead className="w-10 pl-4">
                <Checkbox
                  aria-label={t('table.selectAll')}
                  checked={allSelected ? true : selectedOnPage > 0 ? 'indeterminate' : false}
                  disabled={rows.length === 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.id}
                aria-sort={column.sortable ? ariaSort(sort, column.id) : undefined}
                className={cn('text-xs font-medium tracking-wide text-muted-foreground uppercase', column.className)}
              >
                {column.sortable && onSortChange ? (
                  <button
                    type="button"
                    onClick={() => onSortChange(nextSort(sort, column.id))}
                    className="-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 uppercase outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {column.header}
                    <SortIcon direction={sort?.columnId === column.id ? sort.direction : undefined} />
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {showPlaceholders &&
            Array.from({ length: placeholderRows }, (_, index) => (
              <TableRow key={`placeholder-${index}`} aria-hidden>
                {Array.from({ length: columnCount }, (_, cell) => (
                  <TableCell key={cell} className={cn(cell === 0 && selectable && 'pl-4')}>
                    <Skeleton className={cn('h-4', cell === 0 && selectable ? 'w-4' : 'w-full max-w-32')} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!loading && rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="h-48 text-center text-muted-foreground">
                {emptyState}
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => {
            const id = getRowId(row)
            const isSelected = selectedIds?.has(id) ?? false
            return (
              <TableRow key={id} data-state={isSelected ? 'selected' : undefined}>
                {selectable && (
                  <TableCell className="pl-4">
                    <Checkbox
                      aria-label={t('table.selectRow', { name: getRowLabel(row) })}
                      checked={isSelected}
                      onCheckedChange={() => toggleRow(id)}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function ariaSort(sort: TableSort | undefined, columnId: string): 'ascending' | 'descending' | 'none' {
  if (sort?.columnId !== columnId) return 'none'
  return sort.direction === 'asc' ? 'ascending' : 'descending'
}

/** Pressing the sorted column flips it; pressing another column sorts by it, ascending. */
function nextSort(sort: TableSort | undefined, columnId: string): TableSort {
  if (sort?.columnId === columnId) return { columnId, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
  return { columnId, direction: 'asc' }
}

function SortIcon({ direction }: { direction: TableSort['direction'] | undefined }) {
  if (direction === 'asc') return <ArrowUpIcon className="size-3.5" aria-hidden />
  if (direction === 'desc') return <ArrowDownIcon className="size-3.5" aria-hidden />
  return <ArrowUpDownIcon className="size-3.5 opacity-50" aria-hidden />
}
