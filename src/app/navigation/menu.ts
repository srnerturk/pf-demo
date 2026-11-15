import type { ComponentType } from 'react'

/** A page reachable from the side menu. */
export interface MenuItem {
  label: string
  path: string
}

/** A foldable group of pages in the side menu. */
export interface MenuSection {
  label: string
  icon: ComponentType<{ className?: string }>
  items: readonly MenuItem[]
}
