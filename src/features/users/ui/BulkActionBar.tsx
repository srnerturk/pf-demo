import { UserCheckIcon, UserXIcon, XIcon } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/button'
import type { UserStatus } from '../domain/user'

interface BulkActionBarProps {
  selectedCount: number
  busy: boolean
  onChangeStatus(status: UserStatus): void
  onClear(): void
}

/** What can be done to the chosen users at once. Shown only while some are chosen. */
export function BulkActionBar({ selectedCount, busy, onChangeStatus, onClear }: BulkActionBarProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
      <span className="mr-auto text-sm font-medium">{t('users.bulk.selected', { count: selectedCount })}</span>
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => onChangeStatus('active')}>
        <UserCheckIcon aria-hidden />
        {t('users.bulk.activate')}
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => onChangeStatus('passive')}>
        <UserXIcon aria-hidden />
        {t('users.bulk.deactivate')}
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onClear}>
        <XIcon aria-hidden />
        {t('users.bulk.clear')}
      </Button>
    </div>
  )
}
