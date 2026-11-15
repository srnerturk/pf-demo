import { ChevronRightIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { cn } from '@/shared/lib/utils'
import type { MenuSection } from './menu'

interface SideMenuProps {
  sections: readonly MenuSection[]
  /** Called when the person picks a page, so a frame can close an overlaid menu. */
  onNavigate(): void
}

/** The app's main navigation: sections that unfold into their pages. */
export function SideMenu({ sections, onNavigate }: SideMenuProps) {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Ana menü" className="py-4">
      <p className="px-6 pb-2 text-xs font-medium tracking-wider text-sidebar-muted-foreground uppercase">Menü</p>
      <ul>
        {sections.map((section) => (
          <SideMenuSection
            key={section.label}
            section={section}
            startsOpen={section.items.some((item) => item.path === pathname)}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  )
}

interface SideMenuSectionProps {
  section: MenuSection
  startsOpen: boolean
  onNavigate(): void
}

function SideMenuSection({ section, startsOpen, onNavigate }: SideMenuSectionProps) {
  const [open, setOpen] = useState(startsOpen)
  const itemsId = useId()
  const Icon = section.icon

  return (
    <li className="border-b border-sidebar-border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={itemsId}
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center gap-3 px-6 py-3.5 text-left text-xs font-semibold tracking-wider uppercase transition-colors outline-none hover:bg-sidebar-accent focus-visible:bg-sidebar-accent',
          open && 'bg-sidebar-accent text-sidebar-active',
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="flex-1">{section.label}</span>
        <ChevronRightIcon className={cn('size-4 shrink-0 transition-transform', open && 'rotate-90')} aria-hidden />
      </button>
      {open && (
        <ul id={itemsId} className="bg-sidebar-accent pb-2">
          {section.items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'block py-2 pr-6 pl-13 text-sm transition-colors outline-none hover:text-sidebar-active focus-visible:text-sidebar-active',
                    isActive ? 'font-medium text-sidebar-active' : 'text-sidebar-foreground/80',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
