import { LayoutDashboardIcon } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'

/** Landing page after sign-in. Empty until the dashboard has content of its own. */
export function DashboardHome() {
  const { t } = useI18n()

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('pages.dashboard')}</h1>
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
        <LayoutDashboardIcon className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{t('pages.dashboardEmpty')}</p>
      </div>
    </section>
  )
}
