import { useI18n } from '@/shared/i18n/useI18n'
import { Badge } from '@/shared/ui/badge'

const VISIBLE_ROLES = 2

/** The first few roles as tags, and how many more there are; the full list is in the tooltip. */
export function RoleList({ roles }: { roles: readonly string[] }) {
  const { t } = useI18n()
  const hidden = roles.length - VISIBLE_ROLES

  return (
    <div className="flex flex-wrap items-center gap-1" title={roles.join(', ')}>
      {roles.slice(0, VISIBLE_ROLES).map((role) => (
        <Badge key={role} variant="secondary" className="font-mono text-[0.7rem]">
          {role}
        </Badge>
      ))}
      {hidden > 0 && (
        <Badge variant="outline" className="text-muted-foreground">
          <span className="sr-only">{roles.slice(VISIBLE_ROLES).join(', ')}</span>
          <span aria-hidden>{t('users.moreRoles', { count: hidden })}</span>
        </Badge>
      )}
    </div>
  )
}
