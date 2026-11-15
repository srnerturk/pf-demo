import { LockKeyholeIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface BrandMarkProps {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-2.5 font-semibold tracking-tight', className)}>
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <LockKeyholeIcon className="size-[18px]" aria-hidden />
      </span>
      pf-demo
    </div>
  )
}
