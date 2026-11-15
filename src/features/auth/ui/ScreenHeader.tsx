import { useEffect, useRef, type ReactNode } from 'react'

interface ScreenHeaderProps {
  title: string
  description: ReactNode
  /** Move focus to the title when the screen opens, so assistive technology announces it. */
  focusOnMount?: boolean
}

export function ScreenHeader({ title, description, focusOnMount = false }: ScreenHeaderProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (focusOnMount) titleRef.current?.focus()
  }, [focusOnMount])

  return (
    <header className="mb-6 grid gap-1.5">
      <h1
        ref={titleRef}
        tabIndex={focusOnMount ? -1 : undefined}
        className="text-2xl font-semibold tracking-tight focus:outline-none"
      >
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </header>
  )
}
