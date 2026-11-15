import { KeyRoundIcon, ListChecksIcon, SlidersHorizontalIcon } from 'lucide-react'
import { paths } from '../paths'
import type { MenuSection } from './menu'

/** The admin panel's side menu. Each item becomes a page; see App. */
export const adminMenu: readonly MenuSection[] = [
  {
    labelKey: 'menu.accessControl.title',
    icon: KeyRoundIcon,
    items: [
      { labelKey: 'menu.accessControl.users', path: paths.accessControl.users },
      { labelKey: 'menu.accessControl.roles', path: paths.accessControl.roles },
      { labelKey: 'menu.accessControl.permissions', path: paths.accessControl.permissions },
      { labelKey: 'menu.accessControl.signInHistory', path: paths.accessControl.signInHistory },
    ],
  },
  {
    labelKey: 'menu.configuration.title',
    icon: SlidersHorizontalIcon,
    items: [
      { labelKey: 'menu.configuration.general', path: paths.configuration.general },
      { labelKey: 'menu.configuration.posTerminals', path: paths.configuration.posTerminals },
      { labelKey: 'menu.configuration.commissions', path: paths.configuration.commissions },
      { labelKey: 'menu.configuration.currencies', path: paths.configuration.currencies },
    ],
  },
  {
    labelKey: 'menu.management.title',
    icon: ListChecksIcon,
    items: [
      { labelKey: 'menu.management.banks', path: paths.management.banks },
      { labelKey: 'menu.management.announcements', path: paths.management.announcements },
      { labelKey: 'menu.management.notificationTemplates', path: paths.management.notificationTemplates },
      { labelKey: 'menu.management.auditLog', path: paths.management.auditLog },
    ],
  },
]
