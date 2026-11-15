import { ConstructionIcon } from 'lucide-react'
import type { MessageKey } from '@/shared/i18n/catalog'
import { useI18n } from '@/shared/i18n/useI18n'
import { PageHeader } from '../components/PageHeader'

interface MenuItemPageProps {
  sectionKey: MessageKey
  titleKey: MessageKey
}

/** Stand-in for a menu page that has no content yet: its title, where it sits, and an empty state. */
export function MenuItemPage({ sectionKey, titleKey }: MenuItemPageProps) {
  const { t } = useI18n()

  return (
    <section className="grid gap-6">
      <PageHeader section={t(sectionKey)} title={t(titleKey)} />
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card p-8 text-center">
        <ConstructionIcon className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{t('pages.notBuilt')}</p>
      </div>
    </section>
  )
}
