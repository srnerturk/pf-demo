import { ChevronRightIcon, ConstructionIcon, HomeIcon } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../paths'

interface MenuItemPageProps {
  section: string
  title: string
}

/** Stand-in for a menu page that has no content yet: its title, where it sits, and an empty state. */
export function MenuItemPage({ section, title }: MenuItemPageProps) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link to={paths.home} className="flex items-center hover:text-foreground">
                <HomeIcon className="size-4" aria-hidden />
                <span className="sr-only">Dashboard</span>
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
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card p-8 text-center">
        <ConstructionIcon className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">This page is not built yet.</p>
      </div>
    </section>
  )
}

function BreadcrumbSeparator() {
  return (
    <li role="presentation" aria-hidden>
      <ChevronRightIcon className="size-3.5" />
    </li>
  )
}
