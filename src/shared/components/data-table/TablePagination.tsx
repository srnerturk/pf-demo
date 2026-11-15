import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { pageWindow } from './page-window'

interface TablePaginationProps {
  /** 1-based. */
  page: number
  pageSize: number
  pageSizes: readonly number[]
  total: number
  onPageChange(page: number): void
  onPageSizeChange(pageSize: number): void
}

/** The record count, how many rows a page shows, and a way through the pages. */
export function TablePagination({ page, pageSize, pageSizes, total, onPageChange, onPageSizeChange }: TablePaginationProps) {
  const { t } = useI18n()
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-muted-foreground tabular-nums">{t('table.total', { count: total })}</p>

      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span aria-hidden>{t('table.rowsPerPage')}</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger size="sm" aria-label={t('table.rowsPerPage')} className="tabular-nums">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {pageSizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav aria-label={t('table.pagination')} className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeftIcon aria-hidden />
            <span className="max-sm:sr-only">{t('table.previous')}</span>
          </Button>
          {pageWindow({ page, pageCount }).map((item, index) =>
            item === 'gap' ? (
              <span key={`gap-${index}`} aria-hidden className="w-8 text-center text-sm text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? 'outline' : 'ghost'}
                size="icon-sm"
                aria-label={t('table.page', { page: item })}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
                className={cn('tabular-nums', item === page && 'border-primary text-primary')}
              >
                {item}
              </Button>
            ),
          )}
          <Button type="button" variant="ghost" size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
            <span className="max-sm:sr-only">{t('table.next')}</span>
            <ChevronRightIcon aria-hidden />
          </Button>
        </nav>
      </div>
    </div>
  )
}
