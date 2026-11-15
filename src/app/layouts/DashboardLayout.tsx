import { LogOutIcon, MenuIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet } from 'react-router'
import { useSession } from '@/features/auth/ui/useSession'
import { ThemeToggle } from '@/features/theme/ui/ThemeToggle'
import { LocaleSwitcher } from '@/shared/i18n/LocaleSwitcher'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { BrandMark } from '../components/BrandMark'
import type { MenuSection } from '../navigation/menu'
import { SideMenu } from '../navigation/SideMenu'
import { paths } from '../paths'

interface DashboardLayoutProps {
  menu: readonly MenuSection[]
}

const sideMenuId = 'side-menu'

/**
 * Full-width frame for signed-in pages: the side menu on the left, a header with
 * the language and theme switches, who is signed in and a way out. On narrow screens the side
 * menu slides over the page from the header's menu button.
 */
export function DashboardLayout({ menu }: DashboardLayoutProps) {
  const { session, endSession } = useSession()
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-svh lg:pl-72">
      <aside
        id={sideMenuId}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-sidebar-border bg-sidebar text-sidebar-foreground transition-[translate,visibility] duration-200 lg:translate-x-0 lg:border-r',
          menuOpen ? 'translate-x-0' : 'max-lg:invisible max-lg:-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-6">
          <Link to={paths.home} onClick={closeMenu} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <BrandMark />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t('layout.closeMenu')}
            onClick={closeMenu}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-active lg:hidden"
          >
            <XIcon aria-hidden />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SideMenu sections={menu} onNavigate={closeMenu} />
        </div>
      </aside>

      {menuOpen && <div aria-hidden className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={closeMenu} />}

      <div className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
          <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('layout.openMenu')}
              aria-controls={sideMenuId}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="lg:hidden"
            >
              <MenuIcon aria-hidden />
            </Button>
            <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
              {session && (
<<<<<<< HEAD
                <span className="hidden truncate text-sm text-muted-foreground sm:inline">{session.email}</span>
=======
                <span className="hidden truncate text-sm text-muted-foreground sm:inline">{session.user.email}</span>
>>>>>>> development
              )}
              <LocaleSwitcher />
              <ThemeToggle />
              <Button type="button" variant="outline" size="sm" onClick={endSession}>
                <LogOutIcon aria-hidden />
                {t('layout.signOut')}
              </Button>
            </div>
          </div>
        </header>

        <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
