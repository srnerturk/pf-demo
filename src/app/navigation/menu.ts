import type { ComponentType } from 'react'
import type { MessageKey } from '@/shared/i18n/catalog'

/** A page reachable from the side menu. */
export interface MenuItem {
  labelKey: MessageKey
  path: string
}

/** A foldable group of pages in the side menu. */
export interface MenuSection {
  labelKey: MessageKey
  icon: ComponentType<{ className?: string }>
  items: readonly MenuItem[]
}
