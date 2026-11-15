import { UserManagement, type UserManagementProps } from '@/features/users/ui/UserManagement'
import { useI18n } from '@/shared/i18n/useI18n'
import { PageHeader } from '../components/PageHeader'

/** Giriş Kontrolü › Kullanıcı Yönetimi. */
export function UsersPage(userManagement: UserManagementProps) {
  const { t } = useI18n()

  return (
    <section className="grid gap-6">
      <PageHeader section={t('menu.accessControl.title')} title={t('menu.accessControl.users')} />
      <UserManagement {...userManagement} />
    </section>
  )
}
