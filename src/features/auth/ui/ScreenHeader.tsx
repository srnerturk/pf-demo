import type { ReactNode } from 'react'

interface ScreenHeaderProps {
  title: string
  description: ReactNode
}

export function ScreenHeader({ title, description }: ScreenHeaderProps) {
  return (
    <header className="mb-6 grid gap-1.5">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </header>
  )
}
