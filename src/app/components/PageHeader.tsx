import { ChevronRightIcon, HomeIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useI18n } from '@/shared/i18n/useI18n'
import { paths } from '../paths'

interface PageHeaderProps {
  /** The menu section the page belongs to, shown in the breadcrumb. */
  section: string
  title: string
  /** Page-level actions shown beside the title. */
  actions?: ReactNode
}

/** A page's title and where it sits: home › section › page. */
export function PageHeader({ section, title, actions }: PageHeaderProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <nav aria-label={t('common.breadcrumb')}>
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link to={paths.home} className="flex items-center hover:text-foreground">
                <HomeIcon className="size-4" aria-hidden />
                <span className="sr-only">{t('common.home')}</span>
              </Link>
            </li>
            <BreadcrumbSeparator />
            <li>{section}</li>
            <BreadcrumbSeparator />
            <li aria-current="page" className="font-medium text-foreground">
              {title}
            </li>
          </ol>
        </nav>
      </div>
      {actions}
    </div>
  )
}

function BreadcrumbSeparator() {
  return (
    <li role="presentation" aria-hidden>
      <ChevronRightIcon className="size-3.5" />
    </li>
  )
}
