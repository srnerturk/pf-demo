import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import type { UserStatus } from '../domain/user'

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const { t } = useI18n()

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5',
        status === 'active' ? 'border-success/30 bg-success/10 text-success' : 'bg-muted text-muted-foreground',
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', status === 'active' ? 'bg-success' : 'bg-muted-foreground')} />
      {t(`users.status.${status}`)}
    </Badge>
  )
}
