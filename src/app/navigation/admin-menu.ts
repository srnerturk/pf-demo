import { KeyRoundIcon, ListChecksIcon, SlidersHorizontalIcon } from 'lucide-react'
import { paths } from '../paths'
import type { MenuSection } from './menu'

/** The admin panel's side menu. Each item becomes a page; see App. */
export const adminMenu: readonly MenuSection[] = [
  {
    label: 'Giriş Kontrolü',
    icon: KeyRoundIcon,
    items: [
      { label: 'Kullanıcılar', path: paths.accessControl.users },
      { label: 'Roller', path: paths.accessControl.roles },
      { label: 'Yetkiler', path: paths.accessControl.permissions },
      { label: 'Oturum Geçmişi', path: paths.accessControl.signInHistory },
    ],
  },
  {
    label: 'Yapılandırma',
    icon: SlidersHorizontalIcon,
    items: [
      { label: 'Genel Ayarlar', path: paths.configuration.general },
      { label: 'POS Tanımları', path: paths.configuration.posTerminals },
      { label: 'Komisyon Tanımları', path: paths.configuration.commissions },
      { label: 'Para Birimleri', path: paths.configuration.currencies },
    ],
  },
  {
    label: 'Yönetim',
    icon: ListChecksIcon,
    items: [
      { label: 'Bankalar', path: paths.management.banks },
      { label: 'Duyurular', path: paths.management.announcements },
      { label: 'Bildirim Şablonları', path: paths.management.notificationTemplates },
      { label: 'Sistem Kayıtları', path: paths.management.auditLog },
    ],
  },
]
