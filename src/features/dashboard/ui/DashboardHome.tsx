import { LayoutDashboardIcon } from 'lucide-react'

/** Landing page after sign-in. Empty until the dashboard has content of its own. */
export function DashboardHome() {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
        <LayoutDashboardIcon className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      </div>
    </section>
  )
}
